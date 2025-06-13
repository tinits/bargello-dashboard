class BargelloDashboard {
    constructor() {
        this.datos = {
            tareas: [],
            salud: [],
            archivos_md: [],
            redes_sociales: {},
            configuracion: {}
        };
        this.currentView = 'dashboard';
        this.editingTaskId = null;
        this.currentWeek = new Date();
        this.notificationSystem = null;
        this.breakTimer = null;
        this.markdownFiles = {};
        this.inicializar();
    }

    async inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventListeners();
        this.inicializarVistas();
        this.configurarNotificaciones();
        this.actualizarEstadoSalud();
        this.renderizarTareas();
        await this.cargarArchivosMarkdown();
        this.inicializarSistemaDescansos();
        this.configurarSincronizacionAutomatica();
    }

    // ========================================
    // SISTEMA DE SALUD CORREGIDO
    // ========================================
    registrarSalud() {
        const dolor = parseInt(document.getElementById('dolorSlider').value);
        const fatiga = parseInt(document.getElementById('fatigaSlider').value);
        const sueño = parseInt(document.getElementById('suenoSlider').value);
        const hoy = new Date().toISOString().split('T')[0];

        const nuevoRegistro = {
            fecha: hoy,
            dolor: dolor,
            fatiga: fatiga,
            sueño: sueño,
            timestamp: new Date().getTime(),
            horas_trabajadas: 0
        };

        // Obtener historial existente
        let healthHistory = JSON.parse(localStorage.getItem('healthHistory') || '[]');
        
        // Verificar si ya existe entrada para hoy
        const todayIndex = healthHistory.findIndex(entry => entry.fecha === hoy);
        
        if (todayIndex >= 0) {
            healthHistory[todayIndex] = nuevoRegistro;
        } else {
            healthHistory.push(nuevoRegistro);
        }

        // Mantener solo últimos 30 días
        healthHistory = healthHistory.slice(-30);
        
        // Guardar en localStorage
        localStorage.setItem('healthHistory', JSON.stringify(healthHistory));
        localStorage.setItem('currentHealth', JSON.stringify(nuevoRegistro));
        
        // Actualizar datos internos
        this.datos.salud = healthHistory;
        this.guardarDatos();

        console.log('Datos de salud guardados:', nuevoRegistro);
        
        this.actualizarEstadoSalud();
        this.renderizarGraficoSalud();
        this.mostrarNotificacion('Registro de salud guardado correctamente', 'success');
        
        // Calcular y mostrar recomendaciones
        this.calcularRecomendaciones(dolor, fatiga, sueño);
        
        // Inicializar sistema de descansos
        this.inicializarSistemaDescansos(dolor, fatiga);
    }

    // ========================================
    // SISTEMA DE ARCHIVOS MARKDOWN CORREGIDO
    // ========================================
    async cargarArchivosMarkdown() {
        try {
            // Lista de todos los archivos MD que deberían existir
            const mdFiles = this.generarListaArchivosMarkdown();
            const markdownContent = {};
            
            for (const fileName of mdFiles) {
                try {
                    const response = await fetch(`md-files/${fileName}`);
                    if (response.ok) {
                        const content = await response.text();
                        markdownContent[fileName] = {
                            nombre: fileName,
                            titulo: this.extraerTituloDeNombre(fileName),
                            contenido: content,
                            fechaModificacion: new Date().toISOString()
                        };
                    } else {
                        console.warn(`No se pudo cargar: ${fileName}`);
                        // Crear archivo placeholder
                        markdownContent[fileName] = this.crearArchivoPlaceholder(fileName);
                    }
                } catch (error) {
                    console.error(`Error cargando ${fileName}:`, error);
                    markdownContent[fileName] = this.crearArchivoPlaceholder(fileName);
                }
            }
            
            // Guardar en localStorage y datos internos
            localStorage.setItem('markdownFiles', JSON.stringify(markdownContent));
            this.markdownFiles = markdownContent;
            this.datos.archivos_md = Object.values(markdownContent);
            
            this.actualizarListaArchivosMarkdown();
            console.log(`Cargados ${Object.keys(markdownContent).length} archivos MD`);
            
        } catch (error) {
            console.error('Error general cargando archivos MD:', error);
            this.mostrarNotificacion('Error cargando archivos Markdown', 'error');
        }
    }

    generarListaArchivosMarkdown() {
        const archivos = [];
        
        // Módulo 0 (Biblioteca Base) - 17 puntos
        for (let punto = 1; punto <= 17; punto++) {
            archivos.push(`modulo-0-punto-${punto}.md`);
        }
        
        // Módulos 1-13 - 14 puntos cada uno
        for (let modulo = 1; modulo <= 13; modulo++) {
            for (let punto = 1; punto <= 14; punto++) {
                archivos.push(`modulo-${modulo}-punto-${punto}.md`);
            }
        }
        
        return archivos;
    }

    extraerTituloDeNombre(fileName) {
        const partes = fileName.replace('.md', '').split('-');
        const modulo = partes[1];
        const punto = partes[3];
        return `Módulo ${modulo} - Punto ${punto}`;
    }

    crearArchivoPlaceholder(fileName) {
        const titulo = this.extraerTituloDeNombre(fileName);
        return {
            nombre: fileName,
            titulo: titulo,
            contenido: `# ${titulo}\n\n## Descripción\nContenido por desarrollar...\n\n## Objetivos\n- Objetivo 1\n- Objetivo 2\n\n## Recursos Necesarios\n- Recurso 1\n- Recurso 2`,
            fechaModificacion: new Date().toISOString()
        };
    }

    // ========================================
    // SISTEMA DE REDES SOCIALES MEJORADO
    // ========================================
    configurarRedesSociales() {
        const platformConfigs = {
            instagram: {
                name: 'Instagram',
                handle: '@tinicrafts',
                configured: false,
                apiKey: '',
                accessToken: '',
                postFrequency: '2 veces por semana',
                bestTimes: ['Lunes 18:00', 'Jueves 18:00']
            },
            facebook: {
                name: 'Facebook',
                handle: 'Tinicrafts Bordado',
                configured: false,
                apiKey: '',
                accessToken: '',
                postFrequency: '3 veces por semana',
                bestTimes: ['Martes 14:00', 'Viernes 16:00', 'Domingo 10:00']
            },
            tiktok: {
                name: 'TikTok',
                handle: '@tinicrafts',
                configured: false,
                apiKey: '',
                accessToken: '',
                postFrequency: '4 veces por semana',
                bestTimes: ['Diario 19:00-21:00']
            },
            pinterest: {
                name: 'Pinterest',
                handle: 'Tinicrafts Bordado',
                configured: false,
                apiKey: '',
                accessToken: '',
                postFrequency: '1 vez por semana',
                bestTimes: ['Jueves 10:00']
            },
            youtube: {
                name: 'YouTube',
                handle: 'Tinicrafts Bordado',
                configured: false,
                apiKey: '',
                accessToken: '',
                postFrequency: '1 video por semana',
                bestTimes: ['Miércoles 15:00']
            }
        };

        this.datos.redes_sociales = platformConfigs;
        this.guardarDatos();
    }

    generarSugerenciasContenido() {
        const tareasCompletadas = this.datos.tareas.filter(t => t.progreso > 0);
        const moduloActual = this.obtenerModuloActual();
        
        return {
            instagram: [
                `Time-lapse: Progreso del ${moduloActual.nombre}`,
                `Foto: Resultado final del patrón actual`,
                `Stories: Tips rápidos sobre ${moduloActual.tecnica}`,
                `Reel: Transformación antes/después`,
                `Carousel: Paso a paso del patrón`,
                `IGTV: Tutorial completo de técnica`
            ],
            facebook: [
                `Post educativo: Historia del bordado Bargello`,
                `Encuesta: ¿Cuál es tu patrón favorito?`,
                `Livestream: Sesión de preguntas y respuestas`,
                `Galería: Trabajos de alumnas destacadas`,
                `Evento: Próxima sesión en vivo del taller`,
                `Testimonial: Historia de éxito de alumna`
            ],
            tiktok: [
                `Video corto: Técnica básica en 30 segundos`,
                `Trending: Bordado con música popular`,
                `Tutorial express: Error común y solución`,
                `Satisfying: Video de puntadas perfectas`,
                `Before/After: Transformación rápida`,
                `Dueto: Respondiendo pregunta de seguidora`
            ],
            pinterest: [
                `Infografía: 12 patrones básicos de Bargello`,
                `Paleta de colores: Combinaciones perfectas`,
                `PDF gratuito: Patrón ${moduloActual.patron}`,
                `Inspiración: Tablero de proyectos terminados`,
                `Guía visual: Materiales esenciales`,
                `Tips: Errores comunes a evitar`
            ],
            youtube: [
                `Tutorial completo: ${moduloActual.nombre}`,
                `Masterclass: Teoría del color en Bargello`,
                `Proyecto del mes: Paso a paso completo`,
                `Q&A: Respuestas a preguntas frecuentes`,
                `Behind the scenes: Creación de patrones`,
                `Comparativa: Diferentes técnicas de bordado`
            ]
        };
    }

    obtenerModuloActual() {
        const tareasEnProgreso = this.datos.tareas.filter(t => t.estado === 'en progreso');
        if (tareasEnProgreso.length > 0) {
            const tarea = tareasEnProgreso[0];
            return {
                nombre: tarea.nombre,
                modulo: tarea.modulo,
                tecnica: tarea.seccion,
                patron: this.extraerPatronDeTarea(tarea.nombre)
            };
        }
        return {
            nombre: 'Fundamentos del Bargello',
            modulo: '1',
            tecnica: 'Técnicas básicas',
            patron: 'Point of It All'
        };
    }

    // ========================================
    // SISTEMA DE NOTIFICACIONES DE DESCANSO
    // ========================================
    inicializarSistemaDescansos(dolor = 5, fatiga = 5) {
        // Limpiar timer anterior si existe
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
        }

        // Calcular intervalo de descanso según estado de salud
        const interval = this.calcularIntervaloDescanso(dolor, fatiga);
        
        console.log(`Sistema de descansos iniciado: cada ${interval} minutos`);
        
        // Configurar timer de descansos
        this.breakTimer = setInterval(() => {
            this.mostrarNotificacionDescanso(dolor, fatiga);
        }, interval * 60 * 1000);

        // Solicitar permisos de notificación si no están concedidos
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    calcularIntervaloDescanso(dolor, fatiga) {
        let baseInterval = 45; // minutos base
        
        // Ajustar según nivel de dolor (1-10)
        if (dolor >= 8) baseInterval = 15;
        else if (dolor >= 7) baseInterval = 20;
        else if (dolor >= 5) baseInterval = 30;
        else if (dolor >= 3) baseInterval = 40;
        
        // Ajustar según fatiga (1-10)
        if (fatiga >= 8) baseInterval -= 15;
        else if (fatiga >= 7) baseInterval -= 10;
        else if (fatiga >= 5) baseInterval -= 5;
        
        return Math.max(15, baseInterval); // Mínimo 15 minutos
    }

    mostrarNotificacionDescanso(dolor, fatiga) {
        const duracionDescanso = dolor >= 6 ? 15 : 10;
        
        // Notificación del navegador
        if (Notification.permission === 'granted') {
            new Notification('¡Tiempo de Descanso! 🌸', {
                body: `Has trabajado suficiente. Toma un descanso de ${duracionDescanso} minutos para cuidar tu salud.`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2321808d"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                requireInteraction: true
            });
        }
        
        // Modal en la aplicación
        this.mostrarModalDescanso(duracionDescanso);
    }

    mostrarModalDescanso(duracion) {
        // Crear modal de descanso
        const modal = document.createElement('div');
        modal.className = 'modal modal-break show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>¡Tiempo de Descanso! 🌸</h3>
                </div>
                <div class="modal-body">
                    <p>Cuida tu salud tomando un descanso de ${duracion} minutos</p>
                    <div class="break-timer" id="break-timer">${duracion}:00</div>
                    <div class="break-suggestions">
                        <h4>Sugerencias para tu descanso:</h4>
                        <ul>
                            <li>🧘‍♀️ Respiración profunda y relajación</li>
                            <li>💧 Hidratarse con agua</li>
                            <li>🚶‍♀️ Caminar suavemente</li>
                            <li>👀 Descansar la vista mirando algo lejano</li>
                            <li>🤲 Estiramientos suaves de manos y brazos</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn--primary" onclick="this.closest('.modal').remove()">
                        Entendido
                    </button>
                    <button type="button" class="btn btn--secondary" onclick="dashboard.posponerDescanso()">
                        Posponer 10 min
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Iniciar timer visual
        this.iniciarTimerDescanso(duracion, modal);
    }

    iniciarTimerDescanso(minutos, modal) {
        let timeLeft = minutos * 60; // convertir a segundos
        const timerElement = modal.querySelector('#break-timer');
        
        const countdown = setInterval(() => {
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                timerElement.textContent = '¡Descanso completado!';
                setTimeout(() => {
                    modal.remove();
                }, 3000);
            }
            timeLeft--;
        }, 1000);
    }

    posponerDescanso() {
        // Posponer descanso por 10 minutos
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
        }
        
        setTimeout(() => {
            const healthData = JSON.parse(localStorage.getItem('currentHealth') || '{}');
            this.inicializarSistemaDescansos(healthData.dolor || 5, healthData.fatiga || 5);
        }, 10 * 60 * 1000); // 10 minutos
        
        this.mostrarNotificacion('Descanso pospuesto por 10 minutos', 'info');
    }

    // ========================================
    // GESTIÓN AVANZADA DE TAREAS
    // ========================================
    renderizarTareas() {
        const tbody = document.getElementById('tasksTableBody');
        const tareasFiltradas = this.filtrarTareasArray();
        
        tbody.innerHTML = tareasFiltradas.map(tarea => `
            <tr data-task-id="${tarea.id}">
                <td>
                    <strong>${tarea.nombre}</strong>
                    <br><small class="text-muted">${tarea.descripcion?.substring(0, 100)}...</small>
                </td>
                <td><span class="badge badge-module">Módulo ${tarea.modulo}</span></td>
                <td><span class="status status--${this.getStatusClass(tarea.estado)}">${tarea.estado}</span></td>
                <td>
                    <div class="task-progress">
                        <input type="range" 
                               min="0" 
                               max="100" 
                               value="${tarea.progreso}"
                               onchange="dashboard.actualizarProgresoTarea('${tarea.id}', this.value)"
                               class="progress-slider">
                        <span class="progress-value">${tarea.progreso}%</span>
                    </div>
                </td>
                <td>${tarea.fecha_limite}</td>
                <td><span class="priority-${tarea.prioridad}">${tarea.prioridad}</span></td>
                <td class="task-actions">
                    <button onclick="dashboard.editarTarea('${tarea.id}')" class="btn btn--sm btn--secondary">✏️</button>
                    <button onclick="dashboard.moverTareaHoy('${tarea.id}')" class="btn btn--sm btn--primary">📅</button>
                    <button onclick="dashboard.verMarkdown('${tarea.archivo_md}')" class="btn btn--sm btn--outline">📄</button>
                    <button onclick="dashboard.eliminarTarea('${tarea.id}')" class="btn btn--sm btn--outline text-danger">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    actualizarProgresoTarea(taskId, nuevoProgreso) {
        const indice = this.datos.tareas.findIndex(t => t.id == taskId);
        if (indice !== -1) {
            this.datos.tareas[indice].progreso = parseInt(nuevoProgreso);
            this.datos.tareas[indice].fecha_modificacion = new Date().toISOString();
            
            // Si llega al 100%, marcar como completada
            if (parseInt(nuevoProgreso) === 100) {
                this.datos.tareas[indice].estado = 'completado';
            } else if (parseInt(nuevoProgreso) > 0 && this.datos.tareas[indice].estado === 'pendiente') {
                this.datos.tareas[indice].estado = 'en progreso';
            }
            
            this.guardarDatos();
            this.sincronizarCSV();
            this.actualizarDashboard();
            
            // Actualizar la visualización del valor
            const progressValue = document.querySelector(`tr[data-task-id="${taskId}"] .progress-value`);
            if (progressValue) {
                progressValue.textContent = `${nuevoProgreso}%`;
            }
        }
    }

    moverTareaHoy(taskId) {
        const indice = this.datos.tareas.findIndex(t => t.id == taskId);
        if (indice !== -1) {
            const hoy = new Date().toISOString().split('T')[0];
            this.datos.tareas[indice].fecha_inicio = hoy;
            this.datos.tareas[indice].moved_to_today = true;
            
            this.guardarDatos();
            this.renderizarTareas();
            this.mostrarNotificacion(`Tarea "${this.datos.tareas[indice].nombre}" movida para hoy`, 'success');
        }
    }

    editarTarea(taskId) {
        this.abrirModalTarea(taskId);
    }

    verMarkdown(nombreArchivo) {
        if (nombreArchivo && this.markdownFiles[nombreArchivo]) {
            this.cambiarVista('markdown');
            setTimeout(() => {
                this.cargarArchivoMarkdown(nombreArchivo);
            }, 100);
        } else {
            this.mostrarNotificacion('Archivo Markdown no encontrado', 'warning');
        }
    }

    // ========================================
    // GESTIÓN DE DATOS Y SINCRONIZACIÓN
    // ========================================
    configurarSincronizacionAutomatica() {
        // Sincronización automática cada 5 minutos
        setInterval(() => {
            this.sincronizarDatos();
        }, 5 * 60 * 1000);
        
        // Guardar datos cuando se cierra la página
        window.addEventListener('beforeunload', () => {
            this.guardarDatos();
            this.sincronizarCSV();
        });
    }

    sincronizarDatos() {
        try {
            this.guardarDatos();
            this.sincronizarCSV();
            
            const ahora = new Date().toLocaleString();
            const statusElement = document.getElementById('syncStatus');
            if (statusElement) {
                statusElement.textContent = `Última sincronización: ${ahora}`;
            }
            
            console.log('Datos sincronizados automáticamente');
        } catch (error) {
            console.error('Error en sincronización automática:', error);
        }
    }

    sincronizarCSV() {
        try {
            const csvData = this.generarCSV();
            localStorage.setItem('csvData', csvData);
            localStorage.setItem('lastCSVSync', new Date().toISOString());
        } catch (error) {
            console.error('Error sincronizando CSV:', error);
        }
    }

    generarCSV() {
        const headers = [
            'id', 'nombre', 'descripcion', 'modulo', 'seccion', 'fecha_inicio', 
            'fecha_limite', 'duracion_estimada', 'dependencias', 'prioridad', 
            'progreso', 'estado', 'responsable', 'notas', 'archivo_md', 
            'fecha_creacion', 'fecha_modificacion'
        ];
        
        const rows = this.datos.tareas.map(tarea => [
            tarea.id || '',
            tarea.nombre || '',
            tarea.descripcion || '',
            tarea.modulo || '',
            tarea.seccion || '',
            tarea.fecha_inicio || '',
            tarea.fecha_limite || '',
            tarea.duracion_estimada || '',
            tarea.dependencias || '',
            tarea.prioridad || '',
            tarea.progreso || 0,
            tarea.estado || '',
            tarea.responsable || '',
            tarea.notas || '',
            tarea.archivo_md || '',
            tarea.fecha_creacion || '',
            tarea.fecha_modificacion || ''
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
            
        return csvContent;
    }

    async cargarCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    this.parseCSV(text);
                    this.mostrarNotificacion('CSV cargado exitosamente', 'success');
                } catch (error) {
                    console.error('Error cargando CSV:', error);
                    this.mostrarNotificacion('Error al cargar CSV', 'error');
                }
            }
        };
        
        input.click();
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        const tareas = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
                const tarea = {};
                
                headers.forEach((header, index) => {
                    tarea[header] = values[index] || '';
                });
                
                // Convertir tipos apropiados
                tarea.id = parseInt(tarea.id) || Date.now() + i;
                tarea.progreso = parseInt(tarea.progreso) || 0;
                tarea.duracion_estimada = parseFloat(tarea.duracion_estimada) || 1;
                
                tareas.push(tarea);
            }
        }
        
        this.datos.tareas = tareas;
        this.guardarDatos();
        this.renderizarTareas();
        this.actualizarDashboard();
    }

    exportarCSV() {
        const csvData = this.generarCSV();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `taller_bargello_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        this.mostrarNotificacion('CSV exportado exitosamente', 'success');
    }

    // ========================================
    // MÉTODOS AUXILIARES Y UTILIDADES
    // ========================================
    cargarDatosIniciales() {
        const datosGuardados = localStorage.getItem('bargelloDashboard');
        if (datosGuardados) {
            this.datos = JSON.parse(datosGuardados);
        } else {
            this.datos = {
                tareas: this.generarTareasIniciales(),
                salud: this.generarHistorialSalud(),
                archivos_md: [],
                redes_sociales: {},
                configuracion: {}
            };
            this.configurarRedesSociales();
            this.guardarDatos();
        }

        // Cargar datos de salud del localStorage específico
        const healthHistory = localStorage.getItem('healthHistory');
        if (healthHistory) {
            this.datos.salud = JSON.parse(healthHistory);
        }
    }

    generarTareasIniciales() {
        return [
            {
                id: 1,
                nombre: "Video de Bienvenida y Filosofía del Taller",
                descripcion: "Crear video de bienvenida de 15-20 minutos que presente la filosofía del taller",
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
                notas: "Incluir presentación personal y historia del Bargello",
                archivo_md: "modulo-0-punto-1.md",
                fecha_creacion: new Date().toISOString(),
                fecha_modificacion: new Date().toISOString()
            },
            {
                id: 2,
                nombre: "Patrón Base 1 - Point of It All",
                descripcion: "Desarrollar patrón básico de 8-10 horas con gráfico detallado",
                modulo: "1",
                seccion: "Fundamentos",
                fecha_inicio: "2025-07-15",
                fecha_limite: "2025-07-25",
                duracion_estimada: 20,
                dependencias: "1",
                prioridad: "alta",
                progreso: 0,
                estado: "pendiente",
                responsable: "Tini Sanhueza",
                notas: "Video paso a paso 60 minutos, PDF con gráfico detallado",
                archivo_md: "modulo-1-punto-2.md",
                fecha_creacion: new Date().toISOString(),
                fecha_modificacion: new Date().toISOString()
            }
        ];
    }

    generarHistorialSalud() {
        const historial = [];
        const hoy = new Date();
        for (let i = 29; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            historial.push({
                fecha: fecha.toISOString().split('T')[0],
                dolor: Math.floor(Math.random() * 4) + 4,
                fatiga: Math.floor(Math.random() * 4) + 5,
                sueño: Math.floor(Math.random() * 4) + 5,
                horas_trabajadas: Math.floor(Math.random() * 5) + 2
            });
        }
        return historial;
    }

    guardarDatos() {
        try {
            localStorage.setItem('bargelloDashboard', JSON.stringify(this.datos));
            localStorage.setItem('lastSave', new Date().toISOString());
        } catch (error) {
            console.error('Error guardando datos:', error);
            this.mostrarNotificacion('Error guardando datos', 'error');
        }
    }

    // Método auxiliar para obtener clase de estado
    getStatusClass(estado) {
        const statusMap = {
            'pendiente': 'warning',
            'en progreso': 'info',
            'completado': 'success',
            'cancelado': 'error'
        };
        return statusMap[estado] || 'info';
    }

    // ========================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // ========================================
    configurarEventListeners() {
        // Navegación sidebar
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.cambiarVista(view);
            });
        });

        // Formulario de salud - CORREGIDO
        const healthForm = document.getElementById('healthForm');
        if (healthForm) {
            healthForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarSalud();
            });
        }

        // Sliders de salud
        ['dolorSlider', 'fatigaSlider', 'suenoSlider'].forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id.replace('Slider', 'Value'));
            if (slider && valueSpan) {
                slider.addEventListener('input', () => {
                    valueSpan.textContent = slider.value;
                });
            }
        });

        // Botones de gestión de datos
        const loadCSVBtn = document.getElementById('loadCSV');
        if (loadCSVBtn) {
            loadCSVBtn.addEventListener('click', () => this.cargarCSV());
        }

        const exportCSVBtn = document.getElementById('exportCSV');
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => this.exportarCSV());
        }

        // Resto de event listeners...
        this.configurarEventListenersAdicionales();
    }

    configurarEventListenersAdicionales() {
        // Task management
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.abrirModalTarea());
        }

        // Filtros de tareas
        const searchTasks = document.getElementById('searchTasks');
        if (searchTasks) {
            searchTasks.addEventListener('input', () => this.filtrarTareas());
        }

        // Modal management
        const taskModal = document.getElementById('taskModal');
        if (taskModal) {
            taskModal.addEventListener('click', (e) => {
                if (e.target.id === 'taskModal') {
                    this.cerrarModalTarea();
                }
            });
        }

        // Otros listeners según sea necesario...
    }

    // ========================================
    // MÉTODOS RESTANTES (PLACEHOLDER)
    // ========================================
    
    // Estos métodos necesitan implementación completa según requerimientos
    configurarNotificaciones() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    inicializarVistas() {
        this.cambiarVista('dashboard');
    }

    cambiarVista(vista) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${vista}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === vista) {
                link.classList.add('active');
            }
        });

        this.currentView = vista;
    }

    actualizarEstadoSalud() {
        const currentHealth = JSON.parse(localStorage.getItem('currentHealth') || '{}');
        const statusElement = document.getElementById('healthStatusText');
        
        if (Object.keys(currentHealth).length > 0) {
            const { dolor, fatiga, sueño } = currentHealth;
            const capacidad = this.calcularCapacidadTrabajo(dolor, fatiga, sueño);
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <strong>Estado actual:</strong> Dolor: ${dolor}/10, Fatiga: ${fatiga}/10<br>
                    <strong>Capacidad de trabajo:</strong> ${capacidad.toFixed(1)} horas
                `;
            }
        } else {
            if (statusElement) {
                statusElement.innerHTML = 'No hay registro de salud para hoy. <button onclick="dashboard.cambiarVista(\'salud\')" class="btn btn--sm btn--primary">Registrar ahora</button>';
            }
        }
    }

    calcularCapacidadTrabajo(dolor, fatiga, sueño) {
        let baseHoras = 7;
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
        const workCapacityElement = document.getElementById('workCapacity');
        if (workCapacityElement) {
            workCapacityElement.innerHTML = `
                <div class="recommendation">
                    <h4>Recomendación para hoy</h4>
                    <p><strong>${recomendacion}</strong></p>
                    <p>Capacidad estimada: ${capacidad.toFixed(1)} horas</p>
                </div>
                <div class="suggested-tasks">
                    <h5>Tareas sugeridas:</h5>
                    <ul>
                        ${tareasSugeridas.map(t => `<li>${t.nombre} (${t.duracion_estimada}h)</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }

    actualizarDashboard() {
        // Actualizar métricas generales
        const totalTareas = this.datos.tareas.length;
        const completadas = this.datos.tareas.filter(t => t.estado === 'completado').length;
        const enProgreso = this.datos.tareas.filter(t => t.estado === 'en progreso').length;
        
        // Actualizar elementos del dashboard si existen
        const elementos = {
            'totalTasks': totalTareas,
            'completedTasks': completadas,
            'inProgressTasks': enProgreso,
            'progressPercentage': totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0
        };

        Object.entries(elementos).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value + (id === 'progressPercentage' ? '%' : '');
            }
        });
    }

    filtrarTareas() {
        this.renderizarTareas();
    }

    filtrarTareasArray() {
        let tareas = [...this.datos.tareas];
        
        // Aplicar filtros si existen
        const searchTerm = document.getElementById('searchTasks')?.value.toLowerCase() || '';
        const moduleFilter = document.getElementById('filterModule')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        
        if (searchTerm) {
            tareas = tareas.filter(t => 
                t.nombre.toLowerCase().includes(searchTerm) ||
                t.descripcion.toLowerCase().includes(searchTerm)
            );
        }
        
        if (moduleFilter) {
            tareas = tareas.filter(t => t.modulo === moduleFilter);
        }
        
        if (statusFilter) {
            tareas = tareas.filter(t => t.estado === statusFilter);
        }
        
        return tareas;
    }

    // Placeholder para otros métodos necesarios
    renderizarGraficos() {
        // Implementar gráficos con Chart.js
    }

    renderizarGraficoSalud() {
        // Implementar gráfico de salud
    }

    renderizarTimeline() {
        // Implementar timeline
    }

    renderizarCalendarioSocial() {
        // Implementar calendario de redes sociales
    }

    abrirModalTarea(taskId = null) {
        // Implementar modal de tareas
    }

    cerrarModalTarea() {
        // Implementar cierre de modal
    }

    actualizarListaArchivosMarkdown() {
        const select = document.getElementById('mdFileSelect');
        if (select && this.markdownFiles) {
            select.innerHTML = '<option value="">Seleccionar archivo...</option>' +
                Object.keys(this.markdownFiles).map(fileName => 
                    `<option value="${fileName}">${this.markdownFiles[fileName].titulo}</option>`
                ).join('');
        }
    }

    cargarArchivoMarkdown(fileName) {
        if (this.markdownFiles[fileName]) {
            const select = document.getElementById('mdFileSelect');
            const editor = document.getElementById('markdownEditor');
            const preview = document.getElementById('markdownPreview');
            
            if (select) select.value = fileName;
            if (editor) editor.value = this.markdownFiles[fileName].contenido;
            if (preview) preview.innerHTML = this.markdownFiles[fileName].contenido; // Implementar marked.js
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo} show`;
        notification.textContent = mensaje;
        
        const container = document.getElementById('notifications') || this.crearContenedorNotificaciones();
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    crearContenedorNotificaciones() {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications';
        document.body.appendChild(container);
        return container;
    }

    eliminarTarea(taskId) {
        if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
            this.datos.tareas = this.datos.tareas.filter(t => t.id != taskId);
            this.guardarDatos();
            this.renderizarTareas();
            this.actualizarDashboard();
            this.mostrarNotificacion('Tarea eliminada', 'success');
        }
    }
}

// Inicializar el dashboard cuando se carga la página
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new BargelloDashboard();
    window.dashboard = dashboard; // Hacer accesible globalmente para eventos onclick
});

// Exponer funciones globales necesarias para eventos HTML
window.dashboard = null; // Se asignará cuando se inicialice

