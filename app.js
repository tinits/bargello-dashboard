class BargelloDashboard {
    constructor() {
        this.datos = {
            tareas: [],
            salud: [],
            archivos_md: [],
            redes_sociales: {}
        };
        this.currentView = 'dashboard';
        this.editingTaskId = null;
        this.currentWeek = new Date();
        
        this.inicializar();
    }

    async inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventListeners();
        this.inicializarVistas();
        this.configurarNotificaciones();
        this.actualizarEstadoSalud();
        this.renderizarTareas();
        this.cargarArchivosMarkdown();
    }

    cargarDatosIniciales() {
        // Cargar datos de ejemplo desde localStorage o usar datos por defecto
        const datosGuardados = localStorage.getItem('bargelloDashboard');
        if (datosGuardados) {
            this.datos = JSON.parse(datosGuardados);
        } else {
            // Datos iniciales basados en el JSON proporcionado
            this.datos = {
                tareas: [
                    {
                        id: 1,
                        nombre: "Video de Bienvenida y Filosofía del Taller",
                        descripcion: "Crear video de bienvenida de 15-20 minutos que presente la filosofía del taller, historia del Bargello y expectativas del año",
                        modulo: "0",
                        seccion: "Biblioteca Base",
                        fecha_inicio: "2025-06-17",
                        fecha_limite: "2025-06-20",
                        duracion_estimada: 8,
                        dependencias: "",
                        prioridad: "alta",
                        progreso: 0,
                        estado: "pendiente",
                        responsable: "Tini Sanhueza",
                        notas: "Incluir presentación personal de la instructora, historia del bordado Bargello, filosofía terapéutica del taller",
                        archivo_md: "modulo-0-punto-1.md"
                    },
                    {
                        id: 2,
                        nombre: "Foro de Presentaciones y Comunidad",
                        descripcion: "Configurar foro interactivo en Hotmart con plantillas de presentación y sistema de mentorías",
                        modulo: "0",
                        seccion: "Biblioteca Base",
                        fecha_inicio: "2025-06-17",
                        fecha_limite: "2025-06-25",
                        duracion_estimada: 12,
                        dependencias: "",
                        prioridad: "alta",
                        progreso: 25,
                        estado: "en progreso",
                        responsable: "Tini Sanhueza",
                        notas: "Crear plantilla de presentación personal, guía para compartir experiencia previa",
                        archivo_md: "modulo-0-punto-2.md"
                    },
                    {
                        id: 3,
                        nombre: "Ebook Historia y Fundamentos",
                        descripcion: "Escribir ebook de 50+ páginas sobre orígenes del Bargello en el siglo XVII",
                        modulo: "0",
                        seccion: "Biblioteca Base",
                        fecha_inicio: "2025-06-21",
                        fecha_limite: "2025-07-05",
                        duracion_estimada: 36,
                        dependencias: "1",
                        prioridad: "alta",
                        progreso: 0,
                        estado: "pendiente",
                        responsable: "Tini Sanhueza",
                        notas: "Investigar orígenes del Bargello en Florencia Italia, evolución histórica",
                        archivo_md: "modulo-0-punto-3.md"
                    },
                    {
                        id: 4,
                        nombre: "Video Teórico - Historia y Principios del Bargello",
                        descripcion: "Crear video de 45 minutos sobre orígenes históricos y características distintivas",
                        modulo: "1",
                        seccion: "Fundamentos",
                        fecha_inicio: "2025-07-15",
                        fecha_limite: "2025-07-22",
                        duracion_estimada: 16,
                        dependencias: "3",
                        prioridad: "alta",
                        progreso: 0,
                        estado: "pendiente",
                        responsable: "Tini Sanhueza",
                        notas: "Orígenes en Florencia Italia siglo XVII, evolución del punto florentino",
                        archivo_md: "modulo-1-punto-1.md"
                    },
                    {
                        id: 5,
                        nombre: "Patrón Base 1 - Point of It All",
                        descripcion: "Desarrollar patrón básico de 8-10 horas con gráfico detallado",
                        modulo: "1",
                        seccion: "Fundamentos",
                        fecha_inicio: "2025-07-15",
                        fecha_limite: "2025-07-25",
                        duracion_estimada: 20,
                        dependencias: "4",
                        prioridad: "alta",
                        progreso: 0,
                        estado: "pendiente",
                        responsable: "Tini Sanhueza",
                        notas: "Video paso a paso 60 minutos, PDF con gráfico detallado, 5 combinaciones de color",
                        archivo_md: "modulo-1-punto-2.md"
                    }
                ],
                salud: this.generarHistorialSalud(),
                archivos_md: [
                    {
                        nombre: "modulo-0-punto-1.md",
                        titulo: "Video de Bienvenida y Filosofía del Taller",
                        contenido: "# Módulo 0 - Punto 1: Video de Bienvenida\n\n## Objetivos\n- Presentar la filosofía del taller\n- Explicar la historia del Bargello\n- Establecer expectativas del curso\n\n## Contenido del Video\n1. Presentación personal\n2. Historia del bordado Bargello\n3. Beneficios terapéuticos\n4. Estructura del curso\n\n## Notas de Producción\n- Duración: 15-20 minutos\n- Formato: HD 1080p\n- Incluir subtítulos"
                    },
                    {
                        nombre: "modulo-1-punto-2.md",
                        titulo: "Patrón Base 1 - Point of It All",
                        contenido: "# Módulo 1 - Punto 2: Patrón Point of It All\n\n## Descripción del Patrón\nEste es el patrón fundamental que introduce los conceptos básicos del Bargello.\n\n## Materiales Necesarios\n- Tela Aida 14 count\n- Hilos DMC según paleta\n- Aguja tapicería #24\n\n## Instrucciones\n1. Preparar la tela\n2. Marcar el centro\n3. Comenzar el patrón base\n\n## Variaciones de Color\n- Combinación 1: Azules y verdes\n- Combinación 2: Rojos y naranjas\n- Combinación 3: Tonos tierra"
                    }
                ],
                redes_sociales: {
                    instagram: {
                        handle: "@tinicrafts",
                        frecuencia: "2 veces por semana",
                        horarios: ["Lunes 18:00", "Jueves 18:00"],
                        contenido_sugerido: ["Fotos de progreso", "Time-lapse técnicas", "Stories con tips"]
                    },
                    youtube: {
                        canal: "Tinicrafts Bordado",
                        frecuencia: "1 video por semana",
                        horarios: ["Miércoles 15:00"],
                        contenido_sugerido: ["Tutoriales completos", "Teoría Bargello", "Proyectos mensuales"]
                    }
                }
            };
            this.guardarDatos();
        }
    }

    generarHistorialSalud() {
        const historial = [];
        const hoy = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            
            historial.push({
                fecha: fecha.toISOString().split('T')[0],
                dolor: Math.floor(Math.random() * 4) + 4, // 4-7
                fatiga: Math.floor(Math.random() * 4) + 5, // 5-8
                sueño: Math.floor(Math.random() * 4) + 5, // 5-8
                horas_trabajadas: Math.floor(Math.random() * 5) + 2 // 2-6
            });
        }
        
        return historial;
    }

    configurarEventListeners() {
        // Navegación sidebar
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.cambiarVista(view);
            });
        });

        // Formulario de salud
        document.getElementById('healthForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarSalud();
        });

        // Sliders de salud
        ['dolorSlider', 'fatigaSlider', 'suenoSlider'].forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id.replace('Slider', 'Value'));
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
            });
        });

        // Gestión de tareas
        document.getElementById('addTaskBtn').addEventListener('click', () => this.abrirModalTarea());
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarTarea();
        });
        document.getElementById('closeTaskModal').addEventListener('click', () => this.cerrarModalTarea());
        document.getElementById('cancelTask').addEventListener('click', () => this.cerrarModalTarea());

        // Progress slider in task modal
        document.getElementById('taskProgress').addEventListener('input', (e) => {
            document.getElementById('taskProgressValue').textContent = e.target.value + '%';
        });

        // Filtros de tareas
        document.getElementById('searchTasks').addEventListener('input', () => this.filtrarTareas());
        document.getElementById('filterModule').addEventListener('change', () => this.filtrarTareas());
        document.getElementById('filterStatus').addEventListener('change', () => this.filtrarTareas());

        // Export tasks
        document.getElementById('exportTasksBtn').addEventListener('click', () => this.exportarCSV());

        // Timeline navigation
        document.getElementById('prevWeek').addEventListener('click', () => this.cambiarSemana(-1));
        document.getElementById('nextWeek').addEventListener('click', () => this.cambiarSemana(1));

        // Markdown editor
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.cambiarTabMarkdown(tab);
            });
        });

        document.getElementById('mdFileSelect').addEventListener('change', (e) => {
            this.cargarArchivoMarkdown(e.target.value);
        });

        document.getElementById('saveMarkdown').addEventListener('click', () => this.guardarMarkdown());
        document.getElementById('newMarkdownFile').addEventListener('click', () => this.nuevoArchivoMarkdown());

        // Data management
        document.getElementById('loadCSV').addEventListener('click', () => this.cargarCSV());
        document.getElementById('exportCSV').addEventListener('click', () => this.exportarCSV());
        document.getElementById('syncData').addEventListener('click', () => this.sincronizarDatos());
        document.getElementById('resetData').addEventListener('click', () => this.resetearDatos());

        // Health register button
        document.getElementById('healthRegisterBtn').addEventListener('click', () => {
            this.cambiarVista('salud');
        });

        // Modal click outside to close
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.cerrarModalTarea();
            }
        });
    }

    inicializarVistas() {
        this.cambiarVista('dashboard');
        this.poblarFiltroModulos();
        this.renderizarGraficos();
        this.renderizarTimeline();
        this.renderizarCalendarioSocial();
    }

    cambiarVista(vista) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Mostrar vista seleccionada
        document.getElementById(`${vista}-view`).classList.add('active');

        // Actualizar navegación
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === vista) {
                link.classList.add('active');
            }
        });

        this.currentView = vista;

        // Actualizar contenido específico de la vista
        switch (vista) {
            case 'dashboard':
                this.actualizarDashboard();
                break;
            case 'salud':
                this.actualizarVistasSalud();
                break;
            case 'tareas':
                this.renderizarTareas();
                break;
            case 'timeline':
                this.renderizarTimeline();
                break;
            case 'markdown':
                this.actualizarListaArchivosMarkdown();
                break;
            case 'redes':
                this.renderizarCalendarioSocial();
                break;
        }
    }

    // Función corregida para guardar datos de salud
registrarSalud() {
    const dolor = parseInt(document.getElementById('dolorSlider').value);
    const fatiga = parseInt(document.getElementById('fatigaSlider').value);
    const sueño = parseInt(document.getElementById('suenoSlider').value);
    
    const hoy = new Date().toISOString().split('T')[0];
    
    // Crear objeto de salud
    const nuevoRegistro = {
        fecha: hoy,
        dolor: dolor,
        fatiga: fatiga,
        sueño: sueño,
        timestamp: new Date().getTime()
    };
    
    // Obtener historial existente o crear nuevo
    let historialSalud = JSON.parse(localStorage.getItem('historialSalud') || '[]');
    
    // Verificar si ya existe registro de hoy
    const indiceHoy = historialSalud.findIndex(registro => registro.fecha === hoy);
    
    if (indiceHoy >= 0) {
        historialSalud[indiceHoy] = nuevoRegistro;
    } else {
        historialSalud.push(nuevoRegistro);
    }
    
    // Mantener solo últimos 30 días
    historialSalud = historialSalud.slice(-30);
    
    // Guardar en localStorage
    localStorage.setItem('historialSalud', JSON.stringify(historialSalud));
    localStorage.setItem('saludActual', JSON.stringify(nuevoRegistro));
    
    // Actualizar interfaz
    this.actualizarEstadoSalud();
    this.mostrarNotificacion('Datos de salud guardados correctamente', 'success');
    
    // Calcular recomendaciones
    this.calcularRecomendaciones(dolor, fatiga, sueño);
}

    calcularCapacidadTrabajo(dolor, fatiga, sueño) {
        let baseHoras = 7; // Jornada estándar
        let reduccionDolor = dolor > 6 ? (dolor - 6) * 0.5 : 0;
        let reduccionFatiga = fatiga > 5 ? (fatiga - 5) * 0.3 : 0;
        let bonusSueño = sueño > 7 ? 0.2 : (sueño < 5 ? -0.5 : 0);
        
        return Math.max(2, baseHoras - reduccionDolor - reduccionFatiga + bonusSueño);
    }

    calcularRecomendaciones(dolor, fatiga, sueño) {
        const capacidad = this.calcularCapacidadTrabajo(dolor, fatiga, sueño);
        
        let recomendacion = '';
        let tareasSugeridas = [];

        if (capacidad <= 3) {
            recomendacion = 'Día de descanso - Solo tareas administrativas ligeras';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 2 && t.estado !== 'completado'
            ).slice(0, 2);
        } else if (capacidad <= 5) {
            recomendacion = 'Capacidad moderada - Documentación y lectura';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 4 && t.estado !== 'completado'
            ).slice(0, 3);
        } else if (capacidad <= 6) {
            recomendacion = 'Buen día - Trabajo moderado incluyendo bordado';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 8 && t.estado !== 'completado'
            ).slice(0, 4);
        } else {
            recomendacion = 'Excelente capacidad - Día completo de trabajo';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.estado !== 'completado'
            ).slice(0, 5);
        }

        // Actualizar UI
        document.getElementById('workCapacity').innerHTML = `
            <div class="capacity-info">
                <h4>Capacidad: ${capacidad.toFixed(1)} horas</h4>
                <p>${recomendacion}</p>
            </div>
        `;

        document.getElementById('suggestedTasks').innerHTML = `
            <h4>Tareas Sugeridas:</h4>
            ${tareasSugeridas.map(tarea => `
                <div class="suggested-task">
                    <strong>${tarea.nombre}</strong>
                    <span class="priority-${tarea.prioridad}">${tarea.prioridad}</span>
                </div>
            `).join('')}
        `;

        // Programar recordatorios de descanso
        this.programarDescansos(capacidad);
    }

    programarDescansos(capacidad) {
        // Limpiar recordatorios anteriores
        if (this.descansoInterval) {
            clearInterval(this.descansoInterval);
        }

        // Programar descansos cada 45 minutos si hay capacidad de trabajo
        if (capacidad > 2) {
            this.descansoInterval = setInterval(() => {
                this.mostrarNotificacion('¡Tiempo de descanso! Tómate 10 minutos para relajarte', 'info');
            }, 45 * 60 * 1000); // 45 minutos
        }
    }

    actualizarEstadoSalud() {
        const hoy = new Date().toISOString().split('T')[0];
        const registroHoy = this.datos.salud.find(registro => registro.fecha === hoy);
        
        const statusElement = document.getElementById('healthStatus');
        const currentStatusElement = document.getElementById('currentHealthStatus');
        
        if (registroHoy) {
            const capacidad = this.calcularCapacidadTrabajo(registroHoy.dolor, registroHoy.fatiga, registroHoy.sueño);
            statusElement.innerHTML = `<span class="status status--success">Capacidad: ${capacidad.toFixed(1)}h</span>`;
            
            currentStatusElement.innerHTML = `
                <div class="health-summary">
                    <div>Dolor: ${registroHoy.dolor}/10</div>
                    <div>Fatiga: ${registroHoy.fatiga}/10</div>
                    <div>Sueño: ${registroHoy.sueño}/10</div>
                    <div>Capacidad: ${capacidad.toFixed(1)} horas</div>
                </div>
            `;
        } else {
            statusElement.innerHTML = `<span class="status status--warning">Sin registro hoy</span>`;
            currentStatusElement.innerHTML = `<p>No hay registro de salud para hoy. <a href="#" onclick="dashboard.cambiarVista('salud')">Registrar ahora</a></p>`;
        }
    }

    actualizarVistasSalud() {
        // Actualizar valores de los sliders con último registro
        const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
        if (ultimoRegistro) {
            document.getElementById('dolorSlider').value = ultimoRegistro.dolor;
            document.getElementById('fatigaSlider').value = ultimoRegistro.fatiga;
            document.getElementById('suenoSlider').value = ultimoRegistro.sueño;
            document.getElementById('dolorValue').textContent = ultimoRegistro.dolor;
            document.getElementById('fatigaValue').textContent = ultimoRegistro.fatiga;
            document.getElementById('suenoValue').textContent = ultimoRegistro.sueño;
        }
        
        this.renderizarGraficoSalud();
    }

    // Gestión de Tareas
    abrirModalTarea(taskId = null) {
        this.editingTaskId = taskId;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        
        if (taskId) {
            title.textContent = 'Editar Tarea';
            this.cargarDatosTarea(taskId);
        } else {
            title.textContent = 'Nueva Tarea';
            this.limpiarFormularioTarea();
        }
        
        modal.classList.add('show');
    }

    cerrarModalTarea() {
        document.getElementById('taskModal').classList.remove('show');
        this.editingTaskId = null;
    }

    cargarDatosTarea(taskId) {
        const tarea = this.datos.tareas.find(t => t.id === taskId);
        if (!tarea) return;

        document.getElementById('taskName').value = tarea.nombre;
        document.getElementById('taskDescription').value = tarea.descripcion;
        document.getElementById('taskModule').value = tarea.modulo;
        document.getElementById('taskSection').value = tarea.seccion;
        document.getElementById('taskStartDate').value = tarea.fecha_inicio;
        document.getElementById('taskEndDate').value = tarea.fecha_limite;
        document.getElementById('taskDuration').value = tarea.duracion_estimada;
        document.getElementById('taskPriority').value = tarea.prioridad;
        document.getElementById('taskStatus').value = tarea.estado;
        document.getElementById('taskProgress').value = tarea.progreso;
        document.getElementById('taskProgressValue').textContent = tarea.progreso + '%';
        document.getElementById('taskResponsible').value = tarea.responsable;
        document.getElementById('taskNotes').value = tarea.notas;
    }

    limpiarFormularioTarea() {
        document.getElementById('taskForm').reset();
        document.getElementById('taskProgressValue').textContent = '0%';
        document.getElementById('taskResponsible').value = 'Tini Sanhueza';
    }

    guardarTarea() {
        const formData = new FormData(document.getElementById('taskForm'));
        const tarea = {
            nombre: document.getElementById('taskName').value,
            descripcion: document.getElementById('taskDescription').value,
            modulo: document.getElementById('taskModule').value,
            seccion: document.getElementById('taskSection').value,
            fecha_inicio: document.getElementById('taskStartDate').value,
            fecha_limite: document.getElementById('taskEndDate').value,
            duracion_estimada: parseInt(document.getElementById('taskDuration').value) || 1,
            dependencias: '',
            prioridad: document.getElementById('taskPriority').value,
            progreso: parseInt(document.getElementById('taskProgress').value),
            estado: document.getElementById('taskStatus').value,
            responsable: document.getElementById('taskResponsible').value,
            notas: document.getElementById('taskNotes').value,
            archivo_md: ''
        };

        if (this.editingTaskId) {
            // Editar tarea existente
            const index = this.datos.tareas.findIndex(t => t.id === this.editingTaskId);
            tarea.id = this.editingTaskId;
            this.datos.tareas[index] = tarea;
            this.mostrarNotificacion('Tarea actualizada', 'success');
        } else {
            // Nueva tarea
            tarea.id = Date.now();
            this.datos.tareas.push(tarea);
            this.mostrarNotificacion('Tarea creada', 'success');
        }

        this.guardarDatos();
        this.renderizarTareas();
        this.cerrarModalTarea();
        this.actualizarDashboard();
    }

    eliminarTarea(taskId) {
        if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
            this.datos.tareas = this.datos.tareas.filter(t => t.id !== taskId);
            this.guardarDatos();
            this.renderizarTareas();
            this.mostrarNotificacion('Tarea eliminada', 'success');
            this.actualizarDashboard();
        }
    }

    renderizarTareas() {
        const tbody = document.getElementById('tasksTableBody');
        const tareasFiltradas = this.filtrarTareasArray();
        
        tbody.innerHTML = tareasFiltradas.map(tarea => `
            <tr>
                <td><strong>${tarea.nombre}</strong></td>
                <td>Módulo ${tarea.modulo}</td>
                <td><span class="status status--${this.getStatusClass(tarea.estado)}">${tarea.estado}</span></td>
                <td>
                    <div class="task-progress">
                        <input type="range" min="0" max="100" value="${tarea.progreso}" 
                               onchange="dashboard.actualizarProgreso(${tarea.id}, this.value)">
                        <span>${tarea.progreso}%</span>
                    </div>
                </td>
                <td>${this.formatearFecha(tarea.fecha_limite)}</td>
                <td><span class="priority-${tarea.prioridad}">${tarea.prioridad}</span></td>
                <td class="task-actions">
                    <button class="btn btn--sm btn--secondary" onclick="dashboard.abrirModalTarea(${tarea.id})">Editar</button>
                    <button class="btn btn--sm btn--outline" onclick="dashboard.eliminarTarea(${tarea.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    actualizarProgreso(taskId, progreso) {
        const tarea = this.datos.tareas.find(t => t.id === taskId);
        if (tarea) {
            tarea.progreso = parseInt(progreso);
            
            // Auto-actualizar estado basado en progreso
            if (progreso == 0) {
                tarea.estado = 'pendiente';
            } else if (progreso == 100) {
                tarea.estado = 'completado';
            } else {
                tarea.estado = 'en progreso';
            }
            
            this.guardarDatos();
            this.renderizarTareas();
            this.actualizarDashboard();
        }
    }

    filtrarTareas() {
        this.renderizarTareas();
    }

    filtrarTareasArray() {
        const busqueda = document.getElementById('searchTasks').value.toLowerCase();
        const moduloFiltro = document.getElementById('filterModule').value;
        const estadoFiltro = document.getElementById('filterStatus').value;

        return this.datos.tareas.filter(tarea => {
            const matchBusqueda = !busqueda || 
                tarea.nombre.toLowerCase().includes(busqueda) ||
                tarea.descripcion.toLowerCase().includes(busqueda) ||
                tarea.notas.toLowerCase().includes(busqueda);
            
            const matchModulo = !moduloFiltro || tarea.modulo === moduloFiltro;
            const matchEstado = !estadoFiltro || tarea.estado === estadoFiltro;
            
            return matchBusqueda && matchModulo && matchEstado;
        });
    }

    poblarFiltroModulos() {
        const select = document.getElementById('filterModule');
        const modulos = [...new Set(this.datos.tareas.map(t => t.modulo))].sort();
        
        select.innerHTML = '<option value="">Todos los módulos</option>' +
            modulos.map(modulo => `<option value="${modulo}">Módulo ${modulo}</option>`).join('');
    }

    // Timeline y Cronograma
    renderizarTimeline() {
        const grid = document.getElementById('timelineGrid');
        const inicioSemana = this.getInicioSemana(this.currentWeek);
        
        document.getElementById('currentWeek').textContent = 
            this.formatearSemana(inicioSemana);
        
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        grid.innerHTML = diasSemana.map((dia, index) => {
            const fecha = new Date(inicioSemana);
            fecha.setDate(fecha.getDate() + index);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            const tareasDelDia = this.datos.tareas.filter(tarea => 
                tarea.fecha_inicio <= fechaStr && tarea.fecha_limite >= fechaStr &&
                tarea.estado !== 'completado'
            );
            
            return `
                <div class="timeline-day">
                    <h4>${dia} ${fecha.getDate()}</h4>
                    ${tareasDelDia.map(tarea => `
                        <div class="timeline-task" onclick="dashboard.abrirModalTarea(${tarea.id})">
                            ${tarea.nombre.substring(0, 30)}...
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    }

    cambiarSemana(direccion) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direccion * 7));
        this.renderizarTimeline();
    }

    getInicioSemana(fecha) {
        const inicio = new Date(fecha);
        const dia = inicio.getDay();
        const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1);
        inicio.setDate(diff);
        return inicio;
    }

    formatearSemana(inicio) {
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 6);
        return `${inicio.getDate()}/${inicio.getMonth() + 1} - ${fin.getDate()}/${fin.getMonth() + 1}`;
    }

    // Editor de Markdown
    cargarArchivosMarkdown() {
        const select = document.getElementById('mdFileSelect');
        select.innerHTML = '<option value="">Seleccionar archivo...</option>' +
            this.datos.archivos_md.map(archivo => 
                `<option value="${archivo.nombre}">${archivo.titulo}</option>`
            ).join('');
    }

    // Sistema para cargar archivos markdown
async cargarArchivosMarkdown() {
    // Lista de todos los archivos MD disponibles
    const archivos = [];
    for (let modulo = 0; modulo <= 13; modulo++) {
        for (let punto = 1; punto <= 12; punto++) {
            archivos.push(`modulo-${modulo}-punto-${punto}.md`);
        }
    }
    
    const contenidoMD = {};
    
    for (const archivo of archivos) {
        try {
            const respuesta = await fetch(`md-files/${archivo}`);
            if (respuesta.ok) {
                const contenido = await respuesta.text();
                contenidoMD[archivo] = contenido;
            }
        } catch (error) {
            console.log(`Archivo no encontrado: ${archivo}`);
        }
    }
    
    // Guardar en localStorage
    localStorage.setItem('archivosMD', JSON.stringify(contenidoMD));
    this.actualizarListaArchivosMarkdown();
}


    cambiarTabMarkdown(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        const editor = document.getElementById('markdownEditor');
        const preview = document.getElementById('markdownPreview');
        
        if (tab === 'edit') {
            editor.style.display = 'block';
            preview.classList.add('hidden');
        } else {
            editor.style.display = 'none';
            preview.classList.remove('hidden');
            this.actualizarPreviewMarkdown();
        }
    }

    actualizarPreviewMarkdown() {
        const contenido = document.getElementById('markdownEditor').value;
        const preview = document.getElementById('markdownPreview');
        
        if (typeof marked !== 'undefined') {
            preview.innerHTML = marked.parse(contenido);
        } else {
            // Fallback simple si marked no está disponible
            preview.innerHTML = `<pre>${contenido}</pre>`;
        }
    }

    guardarMarkdown() {
        const select = document.getElementById('mdFileSelect');
        const nombreArchivo = select.value;
        const contenido = document.getElementById('markdownEditor').value;
        
        if (!nombreArchivo) {
            this.mostrarNotificacion('Selecciona un archivo primero', 'warning');
            return;
        }
        
        const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
        if (archivo) {
            archivo.contenido = contenido;
            this.guardarDatos();
            this.mostrarNotificacion('Archivo guardado', 'success');
        }
    }

    nuevoArchivoMarkdown() {
        const nombre = prompt('Nombre del archivo (sin extensión):');
        if (nombre) {
            const nombreCompleto = `${nombre}.md`;
            const nuevoArchivo = {
                nombre: nombreCompleto,
                titulo: nombre.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                contenido: `# ${nombre.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\nContenido del archivo...`
            };
            
            this.datos.archivos_md.push(nuevoArchivo);
            this.guardarDatos();
            this.cargarArchivosMarkdown();
            this.mostrarNotificacion('Archivo creado', 'success');
        }
    }

    actualizarListaArchivosMarkdown() {
        this.cargarArchivosMarkdown();
    }

    // Redes Sociales
    renderizarCalendarioSocial() {
        const calendar = document.getElementById('socialCalendar');
        const suggestions = document.getElementById('contentSuggestions');
        
        // Generar calendario simple para la semana actual
        const hoy = new Date();
        const inicioSemana = this.getInicioSemana(hoy);
        
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const contenidoProgramado = {
            1: ['Instagram: Foto de progreso'], // Lunes
            3: ['YouTube: Tutorial semanal'], // Miércoles
            4: ['Instagram: Stories con tips'] // Jueves
        };
        
        calendar.innerHTML = diasSemana.map((dia, index) => {
            const fecha = new Date(inicioSemana);
            fecha.setDate(fecha.getDate() + index);
            const contenido = contenidoProgramado[index] || [];
            
            return `
                <div class="calendar-day">
                    <div class="calendar-day-header">${dia} ${fecha.getDate()}</div>
                    ${contenido.map(post => `<div class="social-post">${post}</div>`).join('')}
                </div>
            `;
        }).join('');
        
        // Sugerencias de contenido
        suggestions.innerHTML = `
            <h4>Instagram (@tinicrafts)</h4>
            <ul>
                <li>Fotos del progreso del patrón "Point of It All"</li>
                <li>Time-lapse creando el video de bienvenida</li>
                <li>Stories mostrando hilos y materiales</li>
            </ul>
            
            <h4>YouTube (Tinicrafts Bordado)</h4>
            <ul>
                <li>Tutorial: Fundamentos del Bargello</li>
                <li>Historia del bordado florentino</li>
                <li>Q&A sobre técnicas de bordado</li>
            </ul>
        `;
    }

    // Gestión de Datos
    exportarCSV() {
        const csv = this.convertirTareasACSV();
        this.descargarArchivo(csv, 'tareas_bargello.csv', 'text/csv');
        this.mostrarNotificacion('CSV exportado', 'success');
    }

    convertirTareasACSV() {
        const headers = ['id', 'nombre', 'descripcion', 'modulo', 'seccion', 'fecha_inicio', 
                        'fecha_limite', 'duracion_estimada', 'dependencias', 'prioridad', 
                        'progreso', 'estado', 'responsable', 'notas', 'archivo_md'];
        
        const rows = this.datos.tareas.map(tarea => 
            headers.map(header => `"${(tarea[header] || '').toString().replace(/"/g, '""')}"`).join(',')
        );
        
        return [headers.join(','), ...rows].join('\n');
    }

    cargarCSV() {
        const input = document.getElementById('csvFileInput');
        const file = input.files[0];
        
        if (!file) {
            this.mostrarNotificacion('Selecciona un archivo CSV', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
                
                const tareas = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = this.parseCSVLine(lines[i]);
                        const tarea = {};
                        headers.forEach((header, index) => {
                            tarea[header] = values[index] || '';
                        });
                        tareas.push(tarea);
                    }
                }
                
                this.datos.tareas = tareas;
                this.guardarDatos();
                this.renderizarTareas();
                this.poblarFiltroModulos();
                this.mostrarNotificacion('CSV cargado exitosamente', 'success');
            } catch (error) {
                this.mostrarNotificacion('Error al cargar CSV: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result.map(field => field.replace(/^"|"$/g, '').replace(/""/g, '"'));
    }

    sincronizarDatos() {
        this.guardarDatos();
        document.getElementById('lastSync').textContent = new Date().toLocaleString();
        this.mostrarNotificacion('Datos sincronizados', 'success');
    }

    resetearDatos() {
        if (confirm('¿Estás segura? Esto eliminará todos los datos guardados.')) {
            localStorage.removeItem('bargelloDashboard');
            location.reload();
        }
    }

    // Gráficos
    renderizarGraficos() {
        this.renderizarGraficoProgreso();
        this.renderizarGraficoSalud();
    }

    renderizarGraficoProgreso() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const modulos = {};
        this.datos.tareas.forEach(tarea => {
            if (!modulos[tarea.modulo]) {
                modulos[tarea.modulo] = { total: 0, completado: 0 };
            }
            modulos[tarea.modulo].total++;
            if (tarea.estado === 'completado') {
                modulos[tarea.modulo].completado++;
            }
        });

        const labels = Object.keys(modulos).map(m => `Módulo ${m}`);
        const data = Object.values(modulos).map(m => 
            m.total > 0 ? Math.round((m.completado / m.total) * 100) : 0
        );

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Progreso (%)',
                    data: data,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#21809D',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    renderizarGraficoSalud() {
        const ctx = document.getElementById('healthChart');
        if (!ctx) return;

        const ultimos7Dias = this.datos.salud.slice(-7);
        const labels = ultimos7Dias.map(registro => 
            new Date(registro.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
        );

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Dolor',
                        data: ultimos7Dias.map(r => r.dolor),
                        borderColor: '#DB4545',
                        backgroundColor: 'rgba(219, 69, 69, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Fatiga',
                        data: ultimos7Dias.map(r => r.fatiga),
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Sueño',
                        data: ultimos7Dias.map(r => r.sueño),
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    // Notificaciones
    configurarNotificaciones() {
        // Solicitar permisos para notificaciones web
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Configurar recordatorios diarios
        this.configurarRecordatoriosDiarios();
    }

    configurarRecordatoriosDiarios() {
        // Recordatorio diario de registro de salud a las 9:00 AM
        const ahora = new Date();
        const proximoRecordatorio = new Date();
        proximoRecordatorio.setHours(9, 0, 0, 0);
        
        if (proximoRecordatorio <= ahora) {
            proximoRecordatorio.setDate(proximoRecordatorio.getDate() + 1);
        }
        
        const tiempoHastaRecordatorio = proximoRecordatorio.getTime() - ahora.getTime();
        
        setTimeout(() => {
            this.mostrarNotificacion('¡Hora de registrar tu estado de salud!', 'info');
            // Repetir cada 24 horas
            setInterval(() => {
                this.mostrarNotificacion('¡Hora de registrar tu estado de salud!', 'info');
            }, 24 * 60 * 60 * 1000);
        }, tiempoHastaRecordatorio);
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
        
        container.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 300);
        }, 5000);
        
        // Notificación web si está permitida
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Taller Bargello Tinicrafts', {
                body: mensaje,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMUZCOENEIi8+Cjwvc3ZnPgo='
            });
        }
    }

    // Utilidades
    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES');
    }

    getStatusClass(estado) {
        switch (estado) {
            case 'completado': return 'success';
            case 'en progreso': return 'warning';
            case 'pendiente': return 'info';
            default: return 'info';
        }
    }

    descargarArchivo(contenido, nombreArchivo, tipo) {
        const blob = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    guardarDatos() {
        localStorage.setItem('bargelloDashboard', JSON.stringify(this.datos));
    }

    actualizarDashboard() {
        this.actualizarEstadoSalud();
        this.renderizarGraficoProgreso();
    }
}

// Inicializar la aplicación
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new BargelloDashboard();
});

// Hacer la instancia global para acceso desde HTML
window.dashboard = dashboard;
