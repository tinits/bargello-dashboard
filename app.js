class BargelloDashboard {
    constructor() {
        this.tasks = [];
        this.healthRecords = [];
        this.mdFiles = [];
        this.socialAccounts = {};
        this.workTimer = null;
        this.breakTimer = null;
        this.isWorking = false;
        this.workStartTime = null;
        this.breakStartTime = null;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.generateContentSuggestions();
        this.startHealthMonitoring();
        this.updateDashboard();
        this.scanMdFiles();
        this.setupBreakReminders();
    }

    // Gestión de Datos y LocalStorage
    async loadData() {
        try {
            const savedTasks = localStorage.getItem('bargello_tasks');
            const savedHealth = localStorage.getItem('bargello_health');
            const savedSocial = localStorage.getItem('bargello_social');
            const savedMdFiles = localStorage.getItem('bargello_mdfiles');

            if (savedTasks) this.tasks = JSON.parse(savedTasks);
            if (savedHealth) this.healthRecords = JSON.parse(savedHealth);
            if (savedSocial) this.socialAccounts = JSON.parse(savedSocial);
            if (savedMdFiles) this.mdFiles = JSON.parse(savedMdFiles);

            // Cargar CSV por defecto si existe
            try {
                const response = await fetch('data/taller_bargello_completo_detallado.csv');
                if (response.ok) {
                    const csvData = await response.text();
                    this.parseCSV(csvData);
                }
            } catch (error) {
                console.log('No se encontró CSV por defecto');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('bargello_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('bargello_health', JSON.stringify(this.healthRecords));
            localStorage.setItem('bargello_social', JSON.stringify(this.socialAccounts));
            localStorage.setItem('bargello_mdfiles', JSON.stringify(this.mdFiles));
            
            // Auto-backup cada 5 minutos
            clearTimeout(this.backupTimer);
            this.backupTimer = setTimeout(() => this.createBackup(), 300000);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    createBackup() {
        const backup = {
            tasks: this.tasks,
            health: this.healthRecords,
            social: this.socialAccounts,
            mdFiles: this.mdFiles,
            timestamp: new Date().toISOString()
        };
        
        const backupString = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `bargello_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Configuración de Event Listeners
    setupEventListeners() {
        // Sistema robusto de event delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('change', this.handleGlobalChange.bind(this));
        document.addEventListener('input', this.handleGlobalInput.bind(this));
        
        // Formularios
        const healthForm = document.getElementById('healthForm');
        if (healthForm) {
            healthForm.addEventListener('submit', this.handleHealthSubmit.bind(this));
        }
        
        // Carga de archivos
        const csvUpload = document.getElementById('csvUpload');
        if (csvUpload) {
            csvUpload.addEventListener('change', this.handleCSVUpload.bind(this));
        }
        
        const mdUpload = document.getElementById('mdUpload');
        if (mdUpload) {
            mdUpload.addEventListener('change', this.handleMDUpload.bind(this));
        }
        
        // Prevencion de pérdida de datos
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
        
        // Auto-save cada 30 segundos
        setInterval(() => this.saveData(), 30000);
    }

    handleGlobalClick(event) {
        const target = event.target;
        const button = target.closest('button');
        
        if (!button) return;
        
        const id = button.id;
        const className = button.className;
        
        // Quick health button
        if (id === 'quickHealthBtn') {
            this.showQuickHealthDialog();
        }
        // Add new task
        else if (id === 'addNewTaskBtn') {
            this.showNewTaskModal();
        }
        // Export CSV
        else if (id === 'exportCsvBtn') {
            this.exportToCSV();
        }
        // Save social accounts
        else if (id === 'saveSocialAccountsBtn') {
            this.saveSocialAccounts();
        }
        // Scan MD files
        else if (id === 'scanMdFilesBtn') {
            this.scanMdFiles();
        }
        // Break reminders
        else if (id === 'startBreakBtn') {
            this.startBreak();
        }
        else if (id === 'postponeBreakBtn') {
            this.postponeBreak();
        }
        else if (id === 'finishBreakBtn') {
            this.finishBreak();
        }
        // Save new task
        else if (id === 'saveNewTaskBtn') {
            this.saveNewTask();
        }
        // Task actions
        else if (button.dataset.action === 'edit-task') {
            this.editTask(button.dataset.taskId);
        }
        else if (button.dataset.action === 'delete-task') {
            this.deleteTask(button.dataset.taskId);
        }
        // MD file actions
        else if (button.dataset.action === 'open-md') {
            this.openMdFile(button.dataset.filename);
        }
        // Save MD
        else if (id === 'saveMdBtn') {
            this.saveMdFile();
        }
        // Timeline view changes
        else if (id === 'timelineDaily' || id === 'timelineWeekly' || id === 'timelineMonthly') {
            this.updateTimelineView(id.replace('timeline', '').toLowerCase());
        }
    }

    handleGlobalChange(event) {
        const target = event.target;
        const id = target.id;
        
        // Filtros de tareas
        if (id === 'taskSearch' || id === 'moduleFilter' || id === 'statusFilter') {
            this.filterTasks();
        }
        // Rangos de salud
        else if (id === 'painLevel') {
            document.getElementById('painValue').textContent = target.value;
        }
        else if (id === 'fatigueLevel') {
            document.getElementById('fatigueValue').textContent = target.value;
        }
        else if (id === 'sleepQuality') {
            document.getElementById('sleepValue').textContent = target.value;
        }
        // Progress range in new task modal
        else if (id === 'taskProgress') {
            document.getElementById('taskProgressValue').textContent = target.value + '%';
        }
    }

    handleGlobalInput(event) {
        const target = event.target;
        
        // Búsqueda de MD files
        if (target.id === 'mdSearch') {
            this.filterMdFiles();
        }
    }

    // Gestión de Salud
    async handleHealthSubmit(event) {
        event.preventDefault();
        
        const painLevel = parseInt(document.getElementById('painLevel').value);
        const fatigueLevel = parseInt(document.getElementById('fatigueLevel').value);
        const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
        const notes = document.getElementById('healthNotes').value;
        
        const healthRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            pain: painLevel,
            fatigue: fatigueLevel,
            sleep: sleepQuality,
            notes: notes,
            recommendedHours: this.calculateWorkCapacity(painLevel, fatigueLevel, sleepQuality)
        };
        
        // Remover registro del mismo día si existe
        this.healthRecords = this.healthRecords.filter(record => record.date !== healthRecord.date);
        this.healthRecords.push(healthRecord);
        
        // Mantener solo 30 días
        this.healthRecords = this.healthRecords.slice(-30);
        
        this.saveData();
        this.updateHealthRecommendations(healthRecord);
        this.updateDashboard();
        
        // Mostrar confirmación
        this.showAlert('Registro de salud guardado correctamente', 'success');
        
        // Limpiar formulario
        document.getElementById('healthForm').reset();
        document.getElementById('painValue').textContent = '5';
        document.getElementById('fatigueValue').textContent = '5';
        document.getElementById('sleepValue').textContent = '7';
    }

    calculateWorkCapacity(pain, fatigue, sleep) {
        let baseHours = 6; // Jornada base adaptada para fibromialgia
        
        // Reducción por dolor
        if (pain > 6) baseHours -= (pain - 6) * 0.8;
        else if (pain <= 3) baseHours += 0.5;
        
        // Reducción por fatiga
        if (fatigue > 7) baseHours -= (fatigue - 7) * 1.0;
        else if (fatiga <= 3) baseHours += 0.3;
        
        // Ajuste por sueño
        if (sleep < 5) baseHours -= (5 - sleep) * 0.4;
        else if (sleep > 8) baseHours += 0.3;
        
        return Math.max(1, Math.min(8, baseHours));
    }

    updateHealthRecommendations(record) {
        const container = document.getElementById('recommendationsText');
        if (!container) return;
        
        let recommendations = [];
        let alertClass = 'alert-info';
        
        if (record.pain >= 8 || record.fatigue >= 8) {
            alertClass = 'alert-danger';
            recommendations.push('🚨 Día de descanso prioritario. Máximo 2 horas de trabajo liviano.');
            recommendations.push('💊 Considerar medicación de rescate si está disponible.');
            recommendations.push('🛀 Técnicas de relajación: baño caliente, meditación, música suave.');
        } else if (record.pain >= 6 || record.fatigue >= 6) {
            alertClass = 'alert-warning';
            recommendations.push('⚠️ Jornada reducida: ' + record.recommendedHours.toFixed(1) + ' horas máximo.');
            recommendations.push('⏰ Descansos obligatorios cada 30 minutos.');
            recommendations.push('🎯 Enfocar en tareas administrativas o de bajo esfuerzo físico.');
        } else if (record.pain <= 4 && record.fatigue <= 4) {
            alertClass = 'alert-success';
            recommendations.push('✅ Día favorable para productividad.');
            recommendations.push('🎯 Puedes abordar tareas de bordado y video.');
            recommendations.push('⏰ Descansos cada 45 minutos.');
        } else {
            recommendations.push('📊 Jornada moderada: ' + record.recommendedHours.toFixed(1) + ' horas.');
            recommendations.push('🎯 Combinar tareas creativas con administrativas.');
            recommendations.push('⏰ Descansos cada 40 minutos.');
        }
        
        if (record.sleep < 6) {
            recommendations.push('😴 Priorizar descanso adicional hoy.');
        }
        
        container.className = `alert ${alertClass}`;
        container.innerHTML = recommendations.join('<br>');
        
        // Actualizar métricas del dashboard
        document.getElementById('healthLevel').textContent = Math.max(record.pain, record.fatigue);
        document.getElementById('recommendedHours').textContent = record.recommendedHours.toFixed(1) + 'h';
        
        // Configurar recordatorios de descanso basados en el estado
        this.configureBreakReminders(record);
    }

    // Sistema de Recordatorios de Descanso
    configureBreakReminders(healthRecord) {
        const avgLevel = (healthRecord.pain + healthRecord.fatigue) / 2;
        let reminderInterval;
        
        if (avgLevel >= 8) {
            reminderInterval = 20 * 60 * 1000; // 20 minutos
        } else if (avgLevel >= 6) {
            reminderInterval = 30 * 60 * 1000; // 30 minutos
        } else if (avgLevel >= 4) {
            reminderInterval = 40 * 60 * 1000; // 40 minutos
        } else {
            reminderInterval = 45 * 60 * 1000; // 45 minutos
        }
        
        this.breakReminderInterval = reminderInterval;
        this.resetBreakTimer();
    }

    setupBreakReminders() {
        // Configuración por defecto si no hay registro de salud
        this.breakReminderInterval = 45 * 60 * 1000; // 45 minutos por defecto
        this.resetBreakTimer();
    }

    resetBreakTimer() {
        if (this.breakTimer) {
            clearTimeout(this.breakTimer);
        }
        
        this.breakTimer = setTimeout(() => {
            this.showBreakReminder();
        }, this.breakReminderInterval);
        
        this.workStartTime = Date.now();
    }

    showBreakReminder() {
        const reminderDiv = document.getElementById('breakReminder');
        if (reminderDiv) {
            const workMinutes = Math.round((Date.now() - this.workStartTime) / 60000);
            document.getElementById('workTime').textContent = workMinutes;
            reminderDiv.classList.remove('d-none');
            
            // Notificación del navegador si están permitidas
            if (Notification.permission === 'granted') {
                new Notification('¡Hora del Descanso!', {
                    body: `Has trabajado ${workMinutes} minutos. Es momento de descansar.`,
                    icon: '/favicon.ico'
                });
            }
        }
    }

    startBreak() {
        const reminderDiv = document.getElementById('breakReminder');
        if (reminderDiv) {
            reminderDiv.classList.add('d-none');
        }
        
        const breakModal = new bootstrap.Modal(document.getElementById('breakModal'));
        breakModal.show();
        
        this.breakStartTime = Date.now();
        this.startBreakCountdown();
    }

    startBreakCountdown() {
        const breakDuration = 15 * 60 * 1000; // 15 minutos
        const progressBar = document.getElementById('breakProgressBar');
        const timeLeft = document.getElementById('breakTimeLeft');
        
        const updateCountdown = () => {
            const elapsed = Date.now() - this.breakStartTime;
            const remaining = Math.max(0, breakDuration - elapsed);
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            timeLeft.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const progress = ((breakDuration - remaining) / breakDuration) * 100;
            progressBar.style.width = progress + '%';
            
            if (remaining > 0) {
                setTimeout(updateCountdown, 1000);
            } else {
                this.finishBreak();
            }
        };
        
        updateCountdown();
    }

    postponeBreak() {
        const reminderDiv = document.getElementById('breakReminder');
        if (reminderDiv) {
            reminderDiv.classList.add('d-none');
        }
        
        // Posponer 10 minutos
        this.breakTimer = setTimeout(() => {
            this.showBreakReminder();
        }, 10 * 60 * 1000);
    }

    finishBreak() {
        const breakModal = bootstrap.Modal.getInstance(document.getElementById('breakModal'));
        if (breakModal) {
            breakModal.hide();
        }
        
        this.resetBreakTimer();
        this.showAlert('¡Descanso completado! A seguir trabajando.', 'success');
    }

    // Gestión de Tareas
    showNewTaskModal() {
        const modal = new bootstrap.Modal(document.getElementById('newTaskModal'));
        
        // Poblar módulos
        const moduleSelect = document.getElementById('taskModule');
        moduleSelect.innerHTML = '<option value="">Seleccionar módulo</option>';
        
        for (let i = 0; i <= 13; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i === 0 ? 'Biblioteca Base' : `Módulo ${i}`;
            moduleSelect.appendChild(option);
        }
        
        // Fecha por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskStartDate').value = today;
        
        modal.show();
    }

    saveNewTask() {
        const form = document.getElementById('newTaskForm');
        const formData = new FormData(form);
        
        const task = {
            id: Date.now().toString(),
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value,
            module: document.getElementById('taskModule').value,
            section: document.getElementById('taskSection').value,
            priority: document.getElementById('taskPriority').value,
            startDate: document.getElementById('taskStartDate').value,
            dueDate: document.getElementById('taskDueDate').value,
            duration: parseFloat(document.getElementById('taskDuration').value) || 0,
            progress: parseInt(document.getElementById('taskProgress').value) || 0,
            status: 'pending',
            notes: document.getElementById('taskNotes').value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveData();
        this.updateTasksTable();
        this.updateDashboard();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        modal.hide();
        
        // Limpiar formulario
        form.reset();
        
        this.showAlert('Tarea creada correctamente', 'success');
    }

    updateTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const filteredTasks = this.getFilteredTasks();
        
        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            
            const statusClass = task.status === 'completed' ? 'success' : 
                               task.status === 'in_progress' ? 'warning' : 'secondary';
            
            const priorityClass = task.priority === 'high' ? 'danger' : 
                                 task.priority === 'medium' ? 'warning' : 'info';
            
            row.innerHTML = `
                <td>
                    <strong>${task.name}</strong>
                    <br><small class="text-muted">${task.description || 'Sin descripción'}</small>
                </td>
                <td>
                    <span class="badge bg-primary">
                        ${task.module === '0' ? 'Biblioteca' : `Módulo ${task.module}`}
                    </span>
                </td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-${statusClass}" 
                             style="width: ${task.progress}%"
                             data-task-id="${task.id}"
                             data-editable="progress">
                            ${task.progress}%
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${statusClass}">
                        ${this.getStatusText(task.status)}
                    </span>
                    <br>
                    <span class="badge bg-${priorityClass} mt-1">
                        ${this.getPriorityText(task.priority)}
                    </span>
                </td>
                <td>
                    <small>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</small>
                </td>
                <td>
                    <div class="btn-group-vertical btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" 
                                data-action="edit-task" 
                                data-task-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" 
                                data-action="delete-task" 
                                data-task-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    getFilteredTasks() {
        const searchTerm = document.getElementById('taskSearch')?.value.toLowerCase() || '';
        const moduleFilter = document.getElementById('moduleFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        return this.tasks.filter(task => {
            const matchesSearch = !searchTerm || 
                task.name.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm);
            
            const matchesModule = !moduleFilter || task.module === moduleFilter;
            const matchesStatus = !statusFilter || task.status === statusFilter;
            
            return matchesSearch && matchesModule && matchesStatus;
        });
    }

    getStatusText(status) {
        switch(status) {
            case 'pending': return 'Pendiente';
            case 'in_progress': return 'En Progreso';
            case 'completed': return 'Completado';
            default: return 'Desconocido';
        }
    }

    getPriorityText(priority) {
        switch(priority) {
            case 'low': return 'Baja';
            case 'medium': return 'Media';
            case 'high': return 'Alta';
            default: return 'Media';
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Implementar modal de edición similar al de creación
        this.showAlert('Función de edición en desarrollo', 'info');
    }

    deleteTask(taskId) {
        if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.updateTasksTable();
            this.updateDashboard();
            this.showAlert('Tarea eliminada correctamente', 'success');
        }
    }

    filterTasks() {
        this.updateTasksTable();
    }

    // Gestión de CSV
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showAlert('El archivo es demasiado grande. Máximo 10MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
                this.showAlert('CSV cargado correctamente', 'success');
            } catch (error) {
                this.showAlert('Error al procesar el CSV: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    parseCSV(csvData) {
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.warn('CSV parsing warnings:', results.errors);
                }
                
                // Convertir datos CSV a formato de tareas
                const newTasks = results.data.map((row, index) => ({
                    id: row.id || Date.now().toString() + '_' + index,
                    name: row.nombre || row.name || 'Tarea sin nombre',
                    description: row.descripcion || row.description || '',
                    module: row.modulo || row.module || '0',
                    section: row.seccion || row.section || '',
                    priority: row.prioridad || row.priority || 'medium',
                    startDate: row.fecha_inicio || row.startDate || '',
                    dueDate: row.fecha_limite || row.dueDate || '',
                    duration: parseFloat(row.duracion_estimada || row.duration || 0),
                    progress: parseInt(row.progreso || row.progress || 0),
                    status: row.estado || row.status || 'pending',
                    notes: row.notas || row.notes || '',
                    createdAt: row.timestamp_creacion || row.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                
                // Reemplazar tareas existentes o agregar nuevas
                this.tasks = newTasks;
                this.saveData();
                this.updateTasksTable();
                this.updateDashboard();
            },
            error: (error) => {
                this.showAlert('Error al procesar CSV: ' + error.message, 'error');
            }
        });
    }

    exportToCSV() {
        const csvData = Papa.unparse(this.tasks.map(task => ({
            id: task.id,
            nombre: task.name,
            descripcion: task.description,
            modulo: task.module,
            seccion: task.section,
            prioridad: task.priority,
            fecha_inicio: task.startDate,
            fecha_limite: task.dueDate,
            duracion_estimada: task.duration,
            progreso: task.progress,
            estado: task.status,
            notas: task.notes,
            timestamp_creacion: task.createdAt,
            timestamp_modificacion: task.updatedAt
        })));
        
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tareas_bargello_${new Date().toISOString().split('T')[0]}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAlert('CSV exportado correctamente', 'success');
    }

    // Gestión de Archivos Markdown
    async scanMdFiles() {
        try {
            // Intentar cargar el archivo list.json si existe
            const response = await fetch('md-files/list.json');
            if (response.ok) {
                const fileList = await response.json();
                this.mdFiles = fileList;
            } else {
                // Generar lista basada en patrón de archivos
                this.generateMdFilesList();
            }
            
            this.updateMdFilesList();
            this.saveData();
        } catch (error) {
            console.log('Generando lista de archivos MD...');
            this.generateMdFilesList();
        }
    }

    generateMdFilesList() {
        const files = [];
        
        // Generar lista basada en la estructura conocida (módulos 0-13, puntos 1-12+)
        for (let module = 0; module <= 13; module++) {
            const maxPoints = module === 0 ? 17 : 12; // Biblioteca base tiene más puntos
            
            for (let point = 1; point <= maxPoints; point++) {
                const filename = `modulo-${module}-punto-${point}.md`;
                files.push({
                    filename: filename,
                    module: module,
                    point: point,
                    title: `${module === 0 ? 'Biblioteca Base' : 'Módulo ' + module} - Punto ${point}`,
                    path: `md-files/${filename}`,
                    lastModified: null
                });
            }
        }
        
        this.mdFiles = files;
    }

    updateMdFilesList() {
        const container = document.getElementById('mdFilesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const filteredFiles = this.getFilteredMdFiles();
        
        filteredFiles.forEach(file => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${file.title}</h6>
                    <small class="text-muted">${file.module === 0 ? 'Base' : 'M' + file.module}</small>
                </div>
                <p class="mb-1">${file.filename}</p>
                <small class="text-muted">
                    ${file.lastModified ? 'Modificado: ' + new Date(file.lastModified).toLocaleDateString() : 'No cargado'}
                </small>
            `;
            item.dataset.action = 'open-md';
            item.dataset.filename = file.filename;
            
            container.appendChild(item);
        });
    }

    getFilteredMdFiles() {
        const searchTerm = document.getElementById('mdSearch')?.value.toLowerCase() || '';
        
        return this.mdFiles.filter(file => {
            return !searchTerm || 
                file.filename.toLowerCase().includes(searchTerm) ||
                file.title.toLowerCase().includes(searchTerm);
        });
    }

    filterMdFiles() {
        this.updateMdFilesList();
    }

    async openMdFile(filename) {
        try {
            const response = await fetch(`md-files/${filename}`);
            if (response.ok) {
                const content = await response.text();
                document.getElementById('mdEditor').value = content;
                document.getElementById('currentMdFile').value = filename;
                
                // Activar tab de markdown
                const markdownTab = document.querySelector('[data-bs-target="#markdown-tab"]');
                if (markdownTab) {
                    markdownTab.click();
                }
            } else {
                this.showAlert('No se pudo cargar el archivo: ' + filename, 'warning');
                // Crear archivo nuevo
                document.getElementById('mdEditor').value = `# ${filename}\n\n## Contenido\n\nEste archivo está vacío. Comienza a escribir aquí.`;
                document.getElementById('currentMdFile').value = filename;
            }
        } catch (error) {
            this.showAlert('Error al abrir archivo: ' + error.message, 'error');
        }
    }

    handleMDUpload(event) {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith('.md')) {
            this.showAlert('Por favor selecciona un archivo .md válido', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('mdEditor').value = e.target.result;
            document.getElementById('currentMdFile').value = file.name;
            
            // Agregar a la lista si no existe
            const exists = this.mdFiles.find(f => f.filename === file.name);
            if (!exists) {
                this.mdFiles.push({
                    filename: file.name,
                    module: 'custom',
                    point: 0,
                    title: file.name.replace('.md', ''),
                    path: `md-files/${file.name}`,
                    lastModified: new Date().toISOString()
                });
                
                this.updateMdFilesList();
                this.saveData();
            }
            
            this.showAlert('Archivo MD cargado correctamente', 'success');
        };
        reader.readAsText(file);
    }

    saveMdFile() {
        const filename = document.getElementById('currentMdFile').value;
        const content = document.getElementById('mdEditor').value;
        
        if (!filename) {
            this.showAlert('No hay archivo seleccionado para guardar', 'error');
            return;
        }
        
        // Simular guardado (en un entorno real, esto se enviaría al servidor)
        localStorage.setItem(`md_file_${filename}`, content);
        
        // Actualizar timestamp del archivo
        const file = this.mdFiles.find(f => f.filename === filename);
        if (file) {
            file.lastModified = new Date().toISOString();
            this.updateMdFilesList();
            this.saveData();
        }
        
        this.showAlert('Archivo guardado correctamente', 'success');
    }

    // Gestión de Redes Sociales
    saveSocialAccounts() {
        this.socialAccounts = {
            instagram: document.getElementById('instagramHandle').value,
            facebook: document.getElementById('facebookPage').value,
            tiktok: document.getElementById('tiktokHandle').value,
            pinterest: document.getElementById('pinterestHandle').value,
            youtube: document.getElementById('youtubeChannel').value,
            updatedAt: new Date().toISOString()
        };
        
        this.saveData();
        this.generateContentSuggestions();
        this.showAlert('Configuración de redes sociales guardada', 'success');
    }

    generateContentSuggestions() {
        const container = document.getElementById('contentSuggestions');
        if (!container) return;
        
        // Analizar progreso actual para generar sugerencias contextuales
        const moduleProgress = this.getModuleProgress();
        const recentTasks = this.getRecentCompletedTasks();
        
        const suggestions = this.getContextualSuggestions(moduleProgress, recentTasks);
        
        container.innerHTML = '';
        
        Object.entries(suggestions).forEach(([platform, contents]) => {
            const platformDiv = document.createElement('div');
            platformDiv.className = 'mb-3';
            platformDiv.innerHTML = `
                <h6><i class="fab fa-${platform}"></i> ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h6>
                <ul class="list-unstyled">
                    ${contents.map(content => `<li>• ${content}</li>`).join('')}
                </ul>
            `;
            container.appendChild(platformDiv);
        });
        
        this.updateSocialCalendar(suggestions);
    }

    getContextualSuggestions(moduleProgress, recentTasks) {
        const suggestions = {
            instagram: [],
            facebook: [],
            tiktok: [],
            pinterest: [],
            youtube: []
        };
        
        // Sugerencias basadas en el módulo actual
        const currentModule = this.getCurrentModule();
        
        if (currentModule <= 1) {
            suggestions.instagram.push('Time-lapse bordando el primer patrón "Point of It All"');
            suggestions.instagram.push('Stories mostrando la configuración del espacio de bordado');
            suggestions.facebook.push('Publicación sobre los beneficios terapéuticos del bordado Bargello');
            suggestions.youtube.push('Tutorial: "Mis primeros pasos en el bordado Bargello"');
            suggestions.pinterest.push('Infografía: Materiales básicos para empezar en Bargello');
            suggestions.tiktok.push('Video rápido de 30s: "De hilo a arte" transformation');
        } else if (currentModule <= 3) {
            suggestions.instagram.push('Antes y después del proyecto del colgante decorativo');
            suggestions.instagram.push('Carousel con los diferentes patrones aprendidos');
            suggestions.facebook.push('Post educativo sobre la historia del Bargello florentino');
            suggestions.youtube.push('Errores comunes en patrones intermedios y cómo solucionarlos');
            suggestions.pinterest.push('Combinaciones de colores para patrones Fluid y Pine Forest');
            suggestions.tiktok.push('Satisfying video del patrón "Plateau" en progreso');
        } else if (currentModule <= 6) {
            suggestions.instagram.push('Tutorial en IGTV: técnicas de escalado de patrones');
            suggestions.instagram.push('Reel del proceso de la almohada decorativa reversible');
            suggestions.facebook.push('Artículo sobre fibromialgia y crafting como terapia');
            suggestions.youtube.push('Review completa: materiales especiales vs tradicionales');
            suggestions.pinterest.push('Tablero inspiracional: Bargello en decoración moderna');
            suggestions.tiktok.push('Speed run: completando un proyecto en tiempo récord');
        } else {
            suggestions.instagram.push('Showcase de todos los proyectos completados');
            suggestions.instagram.push('Behind the scenes del estudio de bordado');
            suggestions.facebook.push('Testimonios de alumnas y transformaciones personales');
            suggestions.youtube.push('Masterclass avanzada: técnicas de nivel experto');
            suggestions.pinterest.push('Galería de inspiración: Bargello contemporáneo');
            suggestions.tiktok.push('From zero to hero: evolución en bordado Bargello');
        }
        
        // Agregar sugerencias estacionales/mensuales
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) { // Primavera
            suggestions.instagram.push('Paletas de primavera para tus proyectos Bargello');
            suggestions.pinterest.push('Colores frescos de primavera en bordado');
        } else if (month >= 5 && month <= 7) { // Verano
            suggestions.instagram.push('Proyectos Bargello para decoración de verano');
            suggestions.tiktok.push('Bordando en vacaciones: setup móvil');
        } else if (month >= 8 && month <= 10) { // Otoño
            suggestions.pinterest.push('Tonos tierra y ocre en patrones Bargello');
            suggestions.facebook.push('Preparando proyectos para el invierno');
        } else { // Invierno
            suggestions.instagram.push('Cozy winter vibes: bordando junto al fuego');
            suggestions.youtube.push('Proyectos Bargello perfectos para regalar en fiestas');
        }
        
        return suggestions;
    }

    getCurrentModule() {
        // Determinar módulo actual basado en progreso de tareas
        const moduleProgress = {};
        this.tasks.forEach(task => {
            const module = parseInt(task.module) || 0;
            if (!moduleProgress[module]) moduleProgress[module] = [];
            moduleProgress[module].push(task.progress);
        });
        
        let currentModule = 0;
        Object.keys(moduleProgress).forEach(module => {
            const avgProgress = moduleProgress[module].reduce((a, b) => a + b, 0) / moduleProgress[module].length;
            if (avgProgress > 50) {
                currentModule = Math.max(currentModule, parseInt(module));
            }
        });
        
        return currentModule;
    }

    getModuleProgress() {
        const progress = {};
        for (let i = 0; i <= 13; i++) {
            const moduleTasks = this.tasks.filter(task => parseInt(task.module) === i);
            if (moduleTasks.length > 0) {
                const avgProgress = moduleTasks.reduce((sum, task) => sum + task.progress, 0) / moduleTasks.length;
                progress[i] = avgProgress;
            } else {
                progress[i] = 0;
            }
        }
        return progress;
    }

    getRecentCompletedTasks() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.tasks.filter(task => 
            task.status === 'completed' && 
            new Date(task.updatedAt) > weekAgo
        );
    }

    updateSocialCalendar(suggestions) {
        const tbody = document.getElementById('socialCalendarBody');
        if (!tbody) return;
        
        const platforms = ['instagram', 'facebook', 'tiktok', 'pinterest', 'youtube'];
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        tbody.innerHTML = '';
        
        platforms.forEach(platform => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fw-bold text-capitalize">
                    <i class="fab fa-${platform}"></i> ${platform}
                </td>
                ${days.map((day, index) => {
                    const suggestion = suggestions[platform][index % suggestions[platform].length] || '';
                    return `<td><small>${suggestion}</small></td>`;
                }).join('')}
            `;
            tbody.appendChild(row);
        });
    }

    // Dashboard y Visualizaciones
    updateDashboard() {
        this.updateMetrics();
        this.updateCharts();
    }

    updateMetrics() {
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = this.tasks.length;
        
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('totalTasks').textContent = totalTasks;
        
        // Calcular horas trabajadas hoy (simulado)
        const hoursToday = this.calculateHoursToday();
        document.getElementById('hoursToday').textContent = hoursToday.toFixed(1);
        
        // Actualizar último registro de salud
        const lastHealth = this.healthRecords[this.healthRecords.length - 1];
        if (lastHealth) {
            document.getElementById('lastHealthRecord').textContent = new Date(lastHealth.timestamp).toLocaleDateString();
        }
        
        // Posts en redes sociales (simulado)
        document.getElementById('socialPosts').textContent = this.calculateWeeklyPosts();
    }

    calculateHoursToday() {
        // Simulación basada en tareas completadas hoy
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(task => 
            task.updatedAt && task.updatedAt.split('T')[0] === today
        );
        
        return todayTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
    }

    calculateWeeklyPosts() {
        // Simulación de posts semanales
        return Math.floor(this.getCurrentModule() * 1.5);
    }

    updateCharts() {
        this.updateModuleProgressChart();
        this.updateHealthProductivityChart();
        this.updateHealthHistoryChart();
    }

    updateModuleProgressChart() {
        const ctx = document.getElementById('moduleProgressChart');
        if (!ctx) return;
        
        const moduleProgress = this.getModuleProgress();
        
        if (this.moduleChart) {
            this.moduleChart.destroy();
        }
        
        this.moduleChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(moduleProgress).map(m => m === '0' ? 'Base' : `M${m}`),
                datasets: [{
                    label: 'Progreso (%)',
                    data: Object.values(moduleProgress),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#36A2EB', '#FFCE56', '#9966FF',
                        '#FF9F40', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateHealthProductivityChart() {
        const ctx = document.getElementById('healthProductivityChart');
        if (!ctx) return;
        
        if (this.healthChart) {
            this.healthChart.destroy();
        }
        
        const last7Days = this.healthRecords.slice(-7);
        
        this.healthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(record => new Date(record.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Nivel de Dolor',
                        data: last7Days.map(record => record.pain),
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Nivel de Fatiga',
                        data: last7Days.map(record => record.fatigue),
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Horas Recomendadas',
                        data: last7Days.map(record => record.recommendedHours),
                        borderColor: '#4BC0C0',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    updateHealthHistoryChart() {
        const ctx = document.getElementById('healthHistoryChart');
        if (!ctx) return;
        
        if (this.historyChart) {
            this.historyChart.destroy();
        }
        
        const last30Days = this.healthRecords.slice(-30);
        
        this.historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last30Days.map(record => new Date(record.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Dolor',
                        data: last30Days.map(record => record.pain),
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Fatiga',
                        data: last30Days.map(record => record.fatigue),
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Calidad Sueño',
                        data: last30Days.map(record => record.sleep),
                        borderColor: '#4BC0C0',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    // Timeline y Vista Semanal
    updateTimelineView(view) {
        const container = document.getElementById('timelineContainer');
        if (!container) return;
        
        // Actualizar botones activos
        document.querySelectorAll('[id^="timeline"]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`timeline${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
        
        // Generar vista según el tipo
        switch(view) {
            case 'daily':
                this.generateDailyTimeline(container);
                break;
            case 'weekly':
                this.generateWeeklyTimeline(container);
                break;
            case 'monthly':
                this.generateMonthlyTimeline(container);
                break;
        }
    }

    generateDailyTimeline(container) {
        const today = new Date();
        const todayTasks = this.tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === today.toDateString();
        });
        
        container.innerHTML = `
            <h6>Tareas para Hoy (${today.toLocaleDateString()})</h6>
            <div class="row">
                ${todayTasks.length === 0 ? 
                    '<div class="col-12"><div class="alert alert-info">No hay tareas programadas para hoy</div></div>' :
                    todayTasks.map(task => `
                        <div class="col-md-4 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title">${task.name}</h6>
                                    <p class="card-text small">${task.description || 'Sin descripción'}</p>
                                    <div class="progress mb-2">
                                        <div class="progress-bar" style="width: ${task.progress}%">${task.progress}%</div>
                                    </div>
                                    <span class="badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}">${this.getPriorityText(task.priority)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    generateWeeklyTimeline(container) {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes
        
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            weekDays.push(day);
        }
        
        container.innerHTML = `
            <h6>Vista Semanal</h6>
            <div class="row">
                ${weekDays.map(day => {
                    const dayTasks = this.tasks.filter(task => {
                        if (!task.dueDate) return false;
                        const taskDate = new Date(task.dueDate);
                        return taskDate.toDateString() === day.toDateString();
                    });
                    
                    return `
                        <div class="col-md-1.5 mb-3">
                            <div class="card ${day.toDateString() === today.toDateString() ? 'border-primary' : ''}">
                                <div class="card-header text-center">
                                    <small>${day.toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}</small>
                                </div>
                                <div class="card-body p-2">
                                    ${dayTasks.map(task => `
                                        <div class="small mb-1 p-1 bg-light rounded">
                                            ${task.name}
                                            <div class="progress" style="height: 3px;">
                                                <div class="progress-bar" style="width: ${task.progress}%"></div>
                                            </div>
                                        </div>
                                    `).join('') || '<small class="text-muted">Sin tareas</small>'}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    generateMonthlyTimeline(container) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const monthlyTasks = this.tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
        });
        
        // Agrupar por semanas
        const weeks = {};
        monthlyTasks.forEach(task => {
            const taskDate = new Date(task.dueDate);
            const weekNum = Math.ceil(taskDate.getDate() / 7);
            if (!weeks[weekNum]) weeks[weekNum] = [];
            weeks[weekNum].push(task);
        });
        
        container.innerHTML = `
            <h6>Vista Mensual - ${today.toLocaleDateString('es', { month: 'long', year: 'numeric' })}</h6>
            <div class="row">
                ${Object.keys(weeks).map(week => `
                    <div class="col-md-3 mb-3">
                        <div class="card">
                            <div class="card-header">
                                <h6>Semana ${week}</h6>
                            </div>
                            <div class="card-body">
                                ${weeks[week].map(task => `
                                    <div class="mb-2">
                                        <small><strong>${task.name}</strong></small>
                                        <div class="progress" style="height: 5px;">
                                            <div class="progress-bar" style="width: ${task.progress}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Utilidades
    showQuickHealthDialog() {
        // Crear modal rápido para registro de salud
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Registro Rápido de Salud</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label>¿Cómo te sientes hoy? (1-10)</label>
                            <input type="range" class="form-range" min="1" max="10" id="quickPain" value="5">
                            <div class="text-center"><span id="quickPainValue">5</span></div>
                        </div>
                        <button class="btn btn-primary w-100" id="saveQuickHealth">Guardar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Event listeners para el modal rápido
        modal.querySelector('#quickPain').addEventListener('input', (e) => {
            modal.querySelector('#quickPainValue').textContent = e.target.value;
        });
        
        modal.querySelector('#saveQuickHealth').addEventListener('click', () => {
            const level = parseInt(modal.querySelector('#quickPain').value);
            
            const healthRecord = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                pain: level,
                fatigue: level, // Usar mismo valor para registro rápido
                sleep: 7, // Valor por defecto
                notes: 'Registro rápido',
                recommendedHours: this.calculateWorkCapacity(level, level, 7)
            };
            
            this.healthRecords = this.healthRecords.filter(record => record.date !== healthRecord.date);
            this.healthRecords.push(healthRecord);
            this.healthRecords = this.healthRecords.slice(-30);
            
            this.saveData();
            this.updateHealthRecommendations(healthRecord);
            this.updateDashboard();
            
            bsModal.hide();
            document.body.removeChild(modal);
            this.showAlert('Estado de salud registrado', 'success');
        });
        
        // Limpiar modal al cerrar
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    showAlert(message, type = 'info') {
        // Crear alert temporal
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Monitoreo de salud y notificaciones
    startHealthMonitoring() {
        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Recordatorio diario de registro de salud
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM
        
        const timeUntilReminder = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showHealthReminder();
            // Configurar recordatorio diario
            setInterval(() => this.showHealthReminder(), 24 * 60 * 60 * 1000);
        }, timeUntilReminder);
    }

    showHealthReminder() {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = this.healthRecords.find(record => record.date === today);
        
        if (!todayRecord) {
            if (Notification.permission === 'granted') {
                new Notification('Registro de Salud', {
                    body: '¡No olvides registrar cómo te sientes hoy!',
                    icon: '/favicon.ico'
                });
            }
            
            // También mostrar alerta en la interfaz
            this.showAlert('¡No olvides registrar tu estado de salud de hoy!', 'warning');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.bargelloDashboard = new BargelloDashboard();
});

// Registro del Service Worker para funcionalidad offline
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
