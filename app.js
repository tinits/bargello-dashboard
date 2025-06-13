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
        this.markdownFiles = {};
        this.healthChart = null;
        this.progressChart = null;
        this.breakInterval = null;
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
        this.iniciarNotificacionesDescanso();
        this.configurarSincronizacionAutomatica();
    }

    cargarDatosIniciales() {
        const datosGuardados = localStorage.getItem('bargelloDashboard');
        if (datosGuardados) {
            this.datos = JSON.parse(datosGuardados);
        } else {
            // Datos iniciales con tareas del CSV v3
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
                        archivo_md: "modulo-0-punto-1.md",
                        dolor_requerido: 6,
                        fatiga_maxima: 7
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
                        archivo_md: "modulo-0-punto-2.md",
                        dolor_requerido: 5,
                        fatiga_maxima: 6
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
                        archivo_md: "modulo-0-punto-3.md",
                        dolor_requerido: 7,
                        fatiga_maxima: 8
                    }
                ],
                salud: this.generarHistorialSalud(),
                archivos_md: [
                    {
                        nombre: "modulo-0-punto-1.md",
                        titulo: "Video de Bienvenida y Filosofía del Taller",
                        contenido: "# Módulo 0 - Punto 1: Video de Bienvenida\n\n## Objetivos\n- Presentar la filosofía del taller\n- Explicar la historia del Bargello\n- Establecer expectativas del curso\n\n## Contenido del Video\n1. Presentación personal\n2. Historia del bordado Bargello\n3. Beneficios terapéuticos\n4. Estructura del curso"
                    }
                ],
                redes_sociales: {
                    instagram: {
                        handle: "@tinicrafts",
                        frecuencia: "2 veces por semana",
                        horarios: ["Lunes 18:00", "Jueves 18:00"],
                        contenido_sugerido: ["Fotos de progreso", "Time-lapse técnicas", "Stories con tips"],
                        connected: false,
                        apiKey: ""
                    },
                    youtube: {
                        canal: "Tinicrafts Bordado",
                        frecuencia: "1 video por semana",
                        horarios: ["Miércoles 15:00"],
                        contenido_sugerido: ["Tutoriales completos", "Teoría Bargello", "Proyectos mensuales"],
                        connected: false,
                        apiKey: ""
                    },
                    facebook: {
                        pagina: "Tinicrafts",
                        frecuencia: "3 veces por semana",
                        horarios: ["Lunes 12:00", "Miércoles 16:00", "Viernes 19:00"],
                        contenido_sugerido: ["Actualizaciones del taller", "Logros de alumnas", "Posts educativos"],
                        connected: false,
                        apiKey: ""
                    },
                    tiktok: {
                        usuario: "@tinicrafts",
                        frecuencia: "1 vez por semana",
                        horarios: ["Sábado 15:00"],
                        contenido_sugerido: ["Videos cortos transformaciones", "Técnicas en 60 segundos", "Bordado terapéutico"],
                        connected: false,
                        apiKey: ""
                    },
                    pinterest: {
                        perfil: "Tinicrafts Bordado",
                        frecuencia: "2 veces por semana",
                        horarios: ["Martes 10:00", "Viernes 14:00"],
                        contenido_sugerido: ["Infografías de patrones", "Tableros de inspiración", "Guías visuales"],
                        connected: false,
                        apiKey: ""
                    }
                },
                configuracion: {
                    notificaciones_descanso: true,
                    intervalo_descanso: 45, // minutos
                    sincronizacion_automatica: true,
                    tema: 'auto'
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
                sueño: Math.floor(Math.random() * 4) + 5, // 5-8 horas
                horas_trabajadas: Math.floor(Math.random() * 5) + 2, // 2-6
                medicacion: Math.random() > 0.7,
                clima: ['soleado', 'nublado', 'lluvioso'][Math.floor(Math.random() * 3)]
            });
        }
        return historial;
    }

    configurarEventListeners() {
        // Event delegation para elementos dinámicos
        document.addEventListener('click', (e) => this.manejarClicks(e));
        document.addEventListener('change', (e) => this.manejarCambios(e));
        document.addEventListener('input', (e) => this.manejarInputs(e));
        document.addEventListener('submit', (e) => this.manejarSubmits(e));

        // Navegación sidebar
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                this.cambiarVista(view);
            });
        });

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarTodosLosModales();
            }
        });

        // Configurar shortcuts de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.guardarDatos();
                        this.mostrarNotificacion('Datos guardados', 'success');
                        break;
                    case 'n':
                        e.preventDefault();
                        if (this.currentView === 'tareas') {
                            this.abrirModalTarea();
                        }
                        break;
                }
            }
        });
    }

    manejarClicks(e) {
        const target = e.target;

        // Navegación
        if (target.matches('.sidebar__link')) {
            const view = target.dataset.view;
            this.cambiarVista(view);
        }

        // Botones de salud
        if (target.matches('#healthRegisterBtn')) {
            this.registrarSalud();
        }

        // Gestión de tareas
        if (target.matches('#addTaskBtn')) {
            this.abrirModalTarea();
        }

        if (target.matches('.edit-task-btn')) {
            const taskId = parseInt(target.dataset.taskId);
            this.abrirModalTarea(taskId);
        }

        if (target.matches('.delete-task-btn')) {
            const taskId = parseInt(target.dataset.taskId);
            this.eliminarTarea(taskId);
        }

        if (target.matches('.view-md-btn')) {
            const mdFile = target.dataset.mdFile;
            this.abrirVisorMarkdown(mdFile);
        }

        // Modales
        if (target.matches('#closeTaskModal') || target.matches('#cancelTask')) {
            this.cerrarModalTarea();
        }

        if (target.matches('.modal-overlay')) {
            this.cerrarTodosLosModales();
        }

        // Archivos
        if (target.matches('#loadCSV')) {
            this.abrirCargadorCSV();
        }

        if (target.matches('#exportCSV')) {
            this.exportarCSV();
        }

        if (target.matches('#loadMD')) {
            this.abrirCargadorMD();
        }

        if (target.matches('#syncData')) {
            this.sincronizarDatos();
        }

        // Timeline
        if (target.matches('#prevWeek')) {
            this.cambiarSemana(-1);
        }

        if (target.matches('#nextWeek')) {
            this.cambiarSemana(1);
        }

        // Markdown
        if (target.matches('.tab-btn')) {
            const tab = target.dataset.tab;
            this.cambiarTabMarkdown(tab);
        }

        if (target.matches('#saveMarkdown')) {
            this.guardarMarkdown();
        }

        if (target.matches('#newMarkdownFile')) {
            this.nuevoArchivoMarkdown();
        }

        // Redes sociales
        if (target.matches('.connect-social-btn')) {
            const platform = target.dataset.platform;
            this.conectarRedSocial(platform);
        }
    }

    manejarCambios(e) {
        const target = e.target;

        // Filtros de tareas
        if (target.matches('#searchTasks') || target.matches('#filterModule') || target.matches('#filterStatus')) {
            this.filtrarTareas();
        }

        // Progress de tareas inline
        if (target.matches('.task-progress-input')) {
            const taskId = parseInt(target.dataset.taskId);
            const newProgress = parseInt(target.value);
            this.actualizarProgresoTarea(taskId, newProgress);
        }

        // Selección de archivo MD
        if (target.matches('#mdFileSelect')) {
            this.cargarArchivoMarkdown(target.value);
        }
    }

    manejarInputs(e) {
        const target = e.target;

        // Sliders de salud
        if (target.matches('#dolorSlider')) {
            document.getElementById('dolorValue').textContent = target.value;
        }

        if (target.matches('#fatigaSlider')) {
            document.getElementById('fatigaValue').textContent = target.value;
        }

        if (target.matches('#suenoSlider')) {
            document.getElementById('suenoValue').textContent = target.value;
        }

        // Progress slider en modal
        if (target.matches('#taskProgress')) {
            document.getElementById('taskProgressValue').textContent = target.value + '%';
        }

        // Editor markdown con autoguardado
        if (target.matches('#markdownEditor')) {
            clearTimeout(this.markdownSaveTimeout);
            this.markdownSaveTimeout = setTimeout(() => {
                this.autoguardarMarkdown();
            }, 2000);
        }
    }

    manejarSubmits(e) {
        e.preventDefault();

        if (e.target.matches('#healthForm')) {
            this.registrarSalud();
        }

        if (e.target.matches('#taskForm')) {
            this.guardarTarea();
        }
    }

    // Gestión de vistas
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
        const viewElement = document.getElementById(`${vista}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
        }

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

    // Gestión de Salud Específica para Fibromialgia
    registrarSalud() {
        const dolor = parseInt(document.getElementById('dolorSlider').value);
        const fatiga = parseInt(document.getElementById('fatigaSlider').value);
        const sueño = parseInt(document.getElementById('suenoSlider').value);
        const medicacion = document.getElementById('medicacionCheck')?.checked || false;
        const clima = document.getElementById('climaSelect')?.value || 'soleado';
        
        const hoy = new Date().toISOString().split('T')[0];

        // Buscar si ya existe registro de hoy
        const indiceExistente = this.datos.salud.findIndex(registro => registro.fecha === hoy);

        const nuevoRegistro = {
            fecha: hoy,
            dolor,
            fatiga,
            sueño,
            medicacion,
            clima,
            horas_trabajadas: 0,
            timestamp: new Date().toISOString()
        };

        if (indiceExistente !== -1) {
            // Preservar horas trabajadas si ya existían
            nuevoRegistro.horas_trabajadas = this.datos.salud[indiceExistente].horas_trabajadas;
            this.datos.salud[indiceExistente] = nuevoRegistro;
        } else {
            this.datos.salud.push(nuevoRegistro);
        }

        // Mantener solo últimos 30 días
        this.datos.salud = this.datos.salud.slice(-30);

        this.guardarDatos();
        this.actualizarEstadoSalud();
        this.renderizarGraficoSalud();
        this.mostrarNotificacion('Registro de salud guardado correctamente', 'success');

        // Calcular y mostrar recomendaciones
        this.calcularRecomendaciones(dolor, fatiga, sueño, medicacion);
        
        // Ajustar notificaciones de descanso
        this.ajustarNotificacionesDescanso(dolor, fatiga);
    }

    calcularCapacidadTrabajo(dolor, fatiga, sueño, medicacion = false) {
        let baseHoras = 6; // Reducido para fibromialgia

        // Reducción por dolor (más agresiva)
        if (dolor >= 8) baseHoras -= 4;
        else if (dolor >= 6) baseHoras -= (dolor - 5) * 0.8;
        else if (dolor >= 4) baseHoras -= (dolor - 3) * 0.4;

        // Reducción por fatiga
        if (fatiga >= 8) baseHoras -= 3;
        else if (fatiga >= 6) baseHoras -= (fatiga - 5) * 0.6;
        else if (fatiga >= 4) baseHoras -= (fatiga - 3) * 0.3;

        // Ajuste por sueño
        if (sueño < 4) baseHoras -= 2;
        else if (sueño < 6) baseHoras -= 1;
        else if (sueño > 7) baseHoras += 0.5;

        // Bonus por medicación
        if (medicacion && dolor >= 6) baseHoras += 0.5;

        return Math.max(1, Math.min(baseHoras, 7));
    }

    calcularRecomendaciones(dolor, fatiga, sueño, medicacion = false) {
        const capacidad = this.calcularCapacidadTrabajo(dolor, fatiga, sueño, medicacion);
        let recomendacion = '';
        let tareasSugeridas = [];
        let tipoActividad = '';

        if (capacidad <= 2) {
            recomendacion = 'Día de descanso - Solo actividades muy ligeras';
            tipoActividad = 'descanso';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 1 && 
                t.estado !== 'completado' &&
                (!t.dolor_requerido || t.dolor_requerido >= dolor)
            ).slice(0, 1);
        } else if (capacidad <= 3) {
            recomendacion = 'Capacidad baja - Tareas administrativas ligeras';
            tipoActividad = 'administrativo';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 2 && 
                t.estado !== 'completado' &&
                t.seccion !== 'Bordado Práctico'
            ).slice(0, 2);
        } else if (capacidad <= 4) {
            recomendacion = 'Capacidad moderada - Documentación y lectura';
            tipoActividad = 'moderado';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 4 && 
                t.estado !== 'completado'
            ).slice(0, 3);
        } else if (capacidad <= 5) {
            recomendacion = 'Buen día - Trabajo moderado, bordado ligero posible';
            tipoActividad = 'activo';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.duracion_estimada <= 6 && 
                t.estado !== 'completado'
            ).slice(0, 4);
        } else {
            recomendacion = 'Excelente capacidad - Día completo de trabajo';
            tipoActividad = 'completo';
            tareasSugeridas = this.datos.tareas.filter(t => 
                t.estado !== 'completado'
            ).slice(0, 5);
        }

        // Actualizar UI
        const workCapacityEl = document.getElementById('workCapacity');
        if (workCapacityEl) {
            workCapacityEl.innerHTML = `
                <div class="capacity-info">
                    <h4>Capacidad estimada: ${capacidad.toFixed(1)} horas</h4>
                    <p class="capacity-recommendation ${tipoActividad}">${recomendacion}</p>
                    <div class="capacity-bar">
                        <div class="capacity-fill" style="width: ${(capacidad/7)*100}%"></div>
                    </div>
                </div>
            `;
        }

        // Actualizar tareas sugeridas
        this.renderizarTareasSugeridas(tareasSugeridas, capacidad);
    }

    renderizarTareasSugeridas(tareas, capacidad) {
        const container = document.getElementById('suggestedTasks');
        if (!container) return;

        if (tareas.length === 0) {
            container.innerHTML = '<p>No hay tareas apropiadas para tu nivel de energía actual.</p>';
            return;
        }

        const html = tareas.map(tarea => `
            <div class="suggested-task" data-task-id="${tarea.id}">
                <h5>${tarea.nombre}</h5>
                <p class="task-duration">Duración: ${tarea.duracion_estimada}h</p>
                <p class="task-module">Módulo ${tarea.modulo}</p>
                <div class="task-progress-mini">
                    <span>${tarea.progreso}% completado</span>
                    <div class="progress-bar-mini">
                        <div class="progress-fill" style="width: ${tarea.progreso}%"></div>
                    </div>
                </div>
                <button class="btn btn--sm btn--primary start-task-btn" data-task-id="${tarea.id}">
                    Trabajar en esta tarea
                </button>
            </div>
        `).join('');

        container.innerHTML = `
            <h4>Tareas recomendadas para hoy:</h4>
            <div class="suggested-tasks-grid">
                ${html}
            </div>
        `;
    }

    actualizarEstadoSalud() {
        const hoy = new Date().toISOString().split('T')[0];
        const registroHoy = this.datos.salud.find(r => r.fecha === hoy);
        
        const statusEl = document.getElementById('currentHealthStatus');
        if (!statusEl) return;

        if (registroHoy) {
            const capacidad = this.calcularCapacidadTrabajo(
                registroHoy.dolor, 
                registroHoy.fatiga, 
                registroHoy.sueño, 
                registroHoy.medicacion
            );
            
            statusEl.innerHTML = `
                <div class="health-status-current">
                    <h4>Estado de hoy</h4>
                    <div class="health-metrics">
                        <span class="metric dolor-${registroHoy.dolor}">Dolor: ${registroHoy.dolor}/10</span>
                        <span class="metric fatiga-${registroHoy.fatiga}">Fatiga: ${registroHoy.fatiga}/10</span>
                        <span class="metric sueño-${registroHoy.sueño}">Sueño: ${registroHoy.sueño}h</span>
                    </div>
                    <p class="capacity-text">Capacidad de trabajo: ${capacidad.toFixed(1)} horas</p>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="health-status-empty">
                    <p>No hay registro de salud para hoy.</p>
                    <button id="healthRegisterBtn" class="btn btn--primary">Registrar ahora</button>
                </div>
            `;
        }
    }

    actualizarVistasSalud() {
        // Actualizar valores de los sliders con último registro
        const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
        if (ultimoRegistro) {
            const dolorSlider = document.getElementById('dolorSlider');
            const fatigaSlider = document.getElementById('fatigaSlider');
            const suenoSlider = document.getElementById('suenoSlider');

            if (dolorSlider) {
                dolorSlider.value = ultimoRegistro.dolor;
                document.getElementById('dolorValue').textContent = ultimoRegistro.dolor;
            }
            if (fatigaSlider) {
                fatigaSlider.value = ultimoRegistro.fatiga;
                document.getElementById('fatigaValue').textContent = ultimoRegistro.fatiga;
            }
            if (suenoSlider) {
                suenoSlider.value = ultimoRegistro.sueño;
                document.getElementById('suenoValue').textContent = ultimoRegistro.sueño;
            }
        }
        this.renderizarGraficoSalud();
    }

    // Notificaciones de descanso adaptativas
    iniciarNotificacionesDescanso() {
        if (!this.datos.configuracion.notificaciones_descanso) return;

        const hoy = new Date().toISOString().split('T')[0];
        const registroHoy = this.datos.salud.find(r => r.fecha === hoy);

        let intervalo = this.datos.configuracion.intervalo_descanso * 60 * 1000; // Default 45 min

        if (registroHoy) {
            // Ajustar intervalo según estado de salud
            if (registroHoy.dolor >= 8 || registroHoy.fatiga >= 8) {
                intervalo = 20 * 60 * 1000; // 20 minutos
            } else if (registroHoy.dolor >= 6 || registroHoy.fatiga >= 6) {
                intervalo = 30 * 60 * 1000; // 30 minutos
            } else if (registroHoy.dolor >= 4 || registroHoy.fatiga >= 4) {
                intervalo = 45 * 60 * 1000; // 45 minutos
            } else {
                intervalo = 60 * 60 * 1000; // 60 minutos
            }
        }

        if (this.breakInterval) {
            clearInterval(this.breakInterval);
        }

        this.breakInterval = setInterval(() => {
            this.mostrarNotificacionDescanso();
        }, intervalo);
    }

    mostrarNotificacionDescanso() {
        if (document.hidden) return; // No mostrar si la pestaña no está activa

        const modal = this.crearModalDescanso();
        document.body.appendChild(modal);
        modal.classList.add('show');

        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    crearModalDescanso() {
        const modal = document.createElement('div');
        modal.className = 'modal break-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🌸 Tómate un descanso</h3>
                    <button class="modal-close break-close" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Es hora de hacer una pausa para cuidar tu bienestar.</p>
                    <div class="break-suggestions">
                        <h4>Actividades sugeridas:</h4>
                        <ul>
                            <li>🧘‍♀️ Respiración profunda (2-3 minutos)</li>
                            <li>🤸‍♀️ Estiramientos suaves para cuello y hombros</li>
                            <li>👀 Ejercicios oculares</li>
                            <li>🚶‍♀️ Caminar un poco</li>
                            <li>💧 Beber agua</li>
                        </ul>
                    </div>
                    <div class="break-duration">
                        <label>Duración del descanso:</label>
                        <select id="breakDuration">
                            <option value="5">5 minutos</option>
                            <option value="10" selected>10 minutos</option>
                            <option value="15">15 minutos</option>
                            <option value="20">20 minutos</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn--secondary break-close">Ya descansé</button>
                    <button class="btn btn--primary start-break-timer">Iniciar temporizador</button>
                </div>
            </div>
        `;

        // Event listeners para el modal de descanso
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.break-close') || e.target === modal) {
                modal.remove();
            }
            if (e.target.matches('.start-break-timer')) {
                this.iniciarTemporizadorDescanso(modal);
            }
        });

        return modal;
    }

    iniciarTemporizadorDescanso(modal) {
        const duration = parseInt(document.getElementById('breakDuration').value) * 60; // segundos
        let remaining = duration;

        const timerEl = document.createElement('div');
        timerEl.className = 'break-timer';
        
        const updateTimer = () => {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            timerEl.innerHTML = `
                <h4>Tiempo de descanso: ${minutes}:${seconds.toString().padStart(2, '0')}</h4>
                <div class="timer-progress">
                    <div class="timer-fill" style="width: ${((duration - remaining) / duration) * 100}%"></div>
                </div>
            `;
        };

        modal.querySelector('.modal-body').appendChild(timerEl);
        updateTimer();

        const interval = setInterval(() => {
            remaining--;
            updateTimer();

            if (remaining <= 0) {
                clearInterval(interval);
                this.mostrarNotificacion('¡Descanso completado! 💪', 'success');
                modal.remove();
            }
        }, 1000);
    }

    ajustarNotificacionesDescanso(dolor, fatiga) {
        // Reiniciar notificaciones con nuevo intervalo basado en estado actual
        this.iniciarNotificacionesDescanso();
    }

    // Gestión de Tareas
    abrirModalTarea(taskId = null) {
        this.editingTaskId = taskId;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        
        if (!modal) return;

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
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.editingTaskId = null;
    }

    cerrarTodosLosModales() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
            if (modal.classList.contains('break-modal')) {
                modal.remove();
            }
        });
    }

    cargarDatosTarea(taskId) {
        const tarea = this.datos.tareas.find(t => t.id === taskId);
        if (!tarea) return;

        const form = document.getElementById('taskForm');
        if (!form) return;

        // Cargar datos en el formulario
        const fields = {
            'taskName': tarea.nombre,
            'taskDescription': tarea.descripcion,
            'taskModule': tarea.modulo,
            'taskSection': tarea.seccion,
            'taskStartDate': tarea.fecha_inicio,
            'taskEndDate': tarea.fecha_limite,
            'taskDuration': tarea.duracion_estimada,
            'taskPriority': tarea.prioridad,
            'taskStatus': tarea.estado,
            'taskProgress': tarea.progreso,
            'taskResponsible': tarea.responsable,
            'taskNotes': tarea.notas
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        });

        // Actualizar display de progreso
        const progressValue = document.getElementById('taskProgressValue');
        if (progressValue) {
            progressValue.textContent = tarea.progreso + '%';
        }
    }

    limpiarFormularioTarea() {
        const form = document.getElementById('taskForm');
        if (form) {
            form.reset();
            const progressValue = document.getElementById('taskProgressValue');
            if (progressValue) {
                progressValue.textContent = '0%';
            }
            
            const responsible = document.getElementById('taskResponsible');
            if (responsible) {
                responsible.value = 'Tini Sanhueza';
            }
        }
    }

    guardarTarea() {
        const tarea = {
            nombre: document.getElementById('taskName')?.value || '',
            descripcion: document.getElementById('taskDescription')?.value || '',
            modulo: document.getElementById('taskModule')?.value || '0',
            seccion: document.getElementById('taskSection')?.value || '',
            fecha_inicio: document.getElementById('taskStartDate')?.value || '',
            fecha_limite: document.getElementById('taskEndDate')?.value || '',
            duracion_estimada: parseInt(document.getElementById('taskDuration')?.value) || 1,
            dependencias: '',
            prioridad: document.getElementById('taskPriority')?.value || 'media',
            progreso: parseInt(document.getElementById('taskProgress')?.value) || 0,
            estado: document.getElementById('taskStatus')?.value || 'pendiente',
            responsable: document.getElementById('taskResponsible')?.value || 'Tini Sanhueza',
            notas: document.getElementById('taskNotes')?.value || '',
            archivo_md: ''
        };

        // Validación básica
        if (!tarea.nombre.trim()) {
            this.mostrarNotificacion('El nombre de la tarea es obligatorio', 'error');
            return;
        }

        if (this.editingTaskId) {
            // Editar tarea existente
            const index = this.datos.tareas.findIndex(t => t.id === this.editingTaskId);
            if (index !== -1) {
                tarea.id = this.editingTaskId;
                this.datos.tareas[index] = { ...this.datos.tareas[index], ...tarea };
                this.mostrarNotificacion('Tarea actualizada correctamente', 'success');
            }
        } else {
            // Nueva tarea
            tarea.id = Date.now();
            this.datos.tareas.push(tarea);
            this.mostrarNotificacion('Tarea creada correctamente', 'success');
        }

        this.guardarDatos();
        this.renderizarTareas();
        this.cerrarModalTarea();
        this.actualizarDashboard();
    }

    eliminarTarea(taskId) {
        if (confirm('¿Estás segura de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) {
            this.datos.tareas = this.datos.tareas.filter(t => t.id !== taskId);
            this.guardarDatos();
            this.renderizarTareas();
            this.mostrarNotificacion('Tarea eliminada correctamente', 'success');
            this.actualizarDashboard();
        }
    }

    actualizarProgresoTarea(taskId, newProgress) {
        const tarea = this.datos.tareas.find(t => t.id === taskId);
        if (tarea) {
            tarea.progreso = Math.max(0, Math.min(100, newProgress));
            if (tarea.progreso === 100 && tarea.estado !== 'completado') {
                tarea.estado = 'completado';
            } else if (tarea.progreso < 100 && tarea.estado === 'completado') {
                tarea.estado = 'en progreso';
            }
            this.guardarDatos();
            this.renderizarTareas();
            this.mostrarNotificacion(`Progreso actualizado: ${tarea.progreso}%`, 'info');
        }
    }

    renderizarTareas() {
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;

        const tareasFiltradas = this.filtrarTareasArray();
        
        if (tareasFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay tareas que coincidan con los filtros</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tareasFiltradas.map(tarea => `
            <tr class="task-row ${tarea.estado}" data-task-id="${tarea.id}">
                <td>
                    <div class="task-name">
                        <strong>${tarea.nombre}</strong>
                        ${tarea.archivo_md ? `<button class="btn btn--sm view-md-btn" data-md-file="${tarea.archivo_md}">📄</button>` : ''}
                    </div>
                </td>
                <td>
                    <span class="module-badge">Módulo ${tarea.modulo}</span>
                </td>
                <td>
                    <span class="status status--${tarea.estado === 'completado' ? 'success' : tarea.estado === 'en progreso' ? 'warning' : 'info'}">
                        ${tarea.estado}
                    </span>
                </td>
                <td>
                    <div class="task-progress">
                        <input type="range" min="0" max="100" value="${tarea.progreso}" 
                               class="task-progress-input" data-task-id="${tarea.id}">
                        <span class="progress-text">${tarea.progreso}%</span>
                    </div>
                </td>
                <td>${tarea.fecha_limite}</td>
                <td>
                    <span class="priority-${tarea.prioridad}">${tarea.prioridad}</span>
                </td>
                <td class="task-actions">
                    <button class="btn btn--sm btn--secondary edit-task-btn" data-task-id="${tarea.id}">
                        ✏️
                    </button>
                    <button class="btn btn--sm btn--outline delete-task-btn" data-task-id="${tarea.id}">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    filtrarTareasArray() {
        let tareas = [...this.datos.tareas];
        
        const searchTerm = document.getElementById('searchTasks')?.value.toLowerCase() || '';
        const moduleFilter = document.getElementById('filterModule')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';

        if (searchTerm) {
            tareas = tareas.filter(tarea => 
                tarea.nombre.toLowerCase().includes(searchTerm) ||
                tarea.descripcion.toLowerCase().includes(searchTerm) ||
                tarea.notas.toLowerCase().includes(searchTerm)
            );
        }

        if (moduleFilter) {
            tareas = tareas.filter(tarea => tarea.modulo === moduleFilter);
        }

        if (statusFilter) {
            tareas = tareas.filter(tarea => tarea.estado === statusFilter);
        }

        return tareas;
    }

    filtrarTareas() {
        this.renderizarTareas();
    }

    poblarFiltroModulos() {
        const filterModule = document.getElementById('filterModule');
        if (!filterModule) return;

        const modulos = [...new Set(this.datos.tareas.map(t => t.modulo))].sort();
        
        filterModule.innerHTML = `
            <option value="">Todos los módulos</option>
            ${modulos.map(modulo => `<option value="${modulo}">Módulo ${modulo}</option>`).join('')}
        `;
    }

    // Gestión de archivos Markdown
    async cargarArchivosMarkdown() {
        try {
            // Intentar cargar desde list.json si existe
            const response = await fetch('md-files/list.json');
            if (response.ok) {
                const fileList = await response.json();
                
                for (const file of fileList.files) {
                    try {
                        const mdResponse = await fetch(`md-files/${file}`);
                        if (mdResponse.ok) {
                            const mdContent = await mdResponse.text();
                            this.markdownFiles[file] = mdContent;
                            
                            // Agregar a datos si no existe
                            const existingFile = this.datos.archivos_md.find(f => f.nombre === file);
                            if (!existingFile) {
                                this.datos.archivos_md.push({
                                    nombre: file,
                                    titulo: this.extraerTituloMarkdown(mdContent),
                                    contenido: mdContent
                                });
                            }
                        }
                    } catch (e) {
                        console.warn(`No se pudo cargar ${file}:`, e);
                    }
                }
                
                this.guardarDatos();
                this.actualizarListaArchivosMarkdown();
            }
        } catch (e) {
            console.warn('No se encontró list.json, usando archivos MD del localStorage');
        }
    }

    extraerTituloMarkdown(contenido) {
        const match = contenido.match(/^#\s+(.+)$/m);
        return match ? match[1] : 'Archivo sin título';
    }

    actualizarListaArchivosMarkdown() {
        const select = document.getElementById('mdFileSelect');
        if (!select) return;

        select.innerHTML = `
            <option value="">Seleccionar archivo...</option>
            ${this.datos.archivos_md.map(archivo => `
                <option value="${archivo.nombre}">${archivo.titulo}</option>
            `).join('')}
        `;
    }

    cargarArchivoMarkdown(nombreArchivo) {
        if (!nombreArchivo) return;

        const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
        const editor = document.getElementById('markdownEditor');
        const preview = document.getElementById('markdownPreview');

        if (archivo && editor) {
            editor.value = archivo.contenido;
            this.actualizarPreviewMarkdown();
        }
    }

    cambiarTabMarkdown(tab) {
        const editor = document.getElementById('markdownEditor');
        const preview = document.getElementById('markdownPreview');
        const editorTab = document.querySelector('[data-tab="editor"]');
        const previewTab = document.querySelector('[data-tab="preview"]');

        if (!editor || !preview) return;

        // Actualizar tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        if (tab === 'editor') {
            editorTab?.classList.add('active');
            editor.style.display = 'block';
            preview.style.display = 'none';
        } else {
            previewTab?.classList.add('active');
            editor.style.display = 'none';
            preview.style.display = 'block';
            this.actualizarPreviewMarkdown();
        }
    }

    actualizarPreviewMarkdown() {
        const editor = document.getElementById('markdownEditor');
        const preview = document.getElementById('markdownPreview');
        
        if (!editor || !preview) return;

        // Conversión básica de Markdown a HTML
        let html = editor.value
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        // Envolver listas
        html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

        preview.innerHTML = html;
    }

    guardarMarkdown() {
        const select = document.getElementById('mdFileSelect');
        const editor = document.getElementById('markdownEditor');
        
        if (!select || !editor || !select.value) {
            this.mostrarNotificacion('Selecciona un archivo primero', 'warning');
            return;
        }

        const nombreArchivo = select.value;
        const contenido = editor.value;

        const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
        if (archivo) {
            archivo.contenido = contenido;
            archivo.titulo = this.extraerTituloMarkdown(contenido);
            this.guardarDatos();
            this.mostrarNotificacion('Archivo guardado correctamente', 'success');
            this.actualizarListaArchivosMarkdown();
        }
    }

    autoguardarMarkdown() {
        // Autoguardado silencioso cada 2 segundos
        this.guardarMarkdown();
    }

    nuevoArchivoMarkdown() {
        const nombre = prompt('Nombre del archivo (sin extensión):');
        if (!nombre) return;

        const nombreCompleto = `${nombre}.md`;
        
        // Verificar que no exista
        if (this.datos.archivos_md.find(a => a.nombre === nombreCompleto)) {
            this.mostrarNotificacion('Ya existe un archivo con ese nombre', 'error');
            return;
        }

        const nuevoArchivo = {
            nombre: nombreCompleto,
            titulo: nombre.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            contenido: `# ${nombre.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\nContenido del archivo...`
        };

        this.datos.archivos_md.push(nuevoArchivo);
        this.guardarDatos();
        this.actualizarListaArchivosMarkdown();
        this.mostrarNotificacion('Archivo creado correctamente', 'success');

        // Seleccionar el nuevo archivo
        const select = document.getElementById('mdFileSelect');
        if (select) {
            select.value = nombreCompleto;
            this.cargarArchivoMarkdown(nombreCompleto);
        }
    }

    abrirVisorMarkdown(nombreArchivo) {
        const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
        if (!archivo) {
            this.mostrarNotificacion('Archivo no encontrado', 'error');
            return;
        }

        // Cambiar a vista markdown y cargar archivo
        this.cambiarVista('markdown');
        
        setTimeout(() => {
            const select = document.getElementById('mdFileSelect');
            if (select) {
                select.value = nombreArchivo;
                this.cargarArchivoMarkdown(nombreArchivo);
            }
        }, 100);
    }

    // Redes Sociales
    renderizarCalendarioSocial() {
        const calendar = document.getElementById('socialCalendar');
        const suggestions = document.getElementById('contentSuggestions');
        
        if (!calendar || !suggestions) return;

        // Generar calendario para la semana actual
        const hoy = new Date();
        const inicioSemana = this.getInicioSemana(hoy);
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        // Contenido programado basado en configuración
        const contenidoProgramado = this.generarContenidoProgramado();

        calendar.innerHTML = `
            <h3>Calendario de Contenido - Semana del ${inicioSemana.toLocaleDateString()}</h3>
            <div class="calendar-grid">
                ${diasSemana.map((dia, index) => {
                    const fecha = new Date(inicioSemana);
                    fecha.setDate(fecha.getDate() + index);
                    const contenido = contenidoProgramado[index] || [];
                    
                    return `
                        <div class="calendar-day">
                            <div class="calendar-day-header">${dia} ${fecha.getDate()}</div>
                            <div class="social-posts">
                                ${contenido.map(post => `
                                    <div class="social-post ${post.platform}">
                                        ${post.platform}: ${post.content}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.renderizarSugerenciasContenido(suggestions);
    }

    generarContenidoProgramado() {
        const programacion = {};
        
        // Basado en la configuración de redes sociales
        Object.entries(this.datos.redes_sociales).forEach(([platform, config]) => {
            config.horarios?.forEach(horario => {
                const [dia, hora] = horario.split(' ');
                const diaIndex = this.getDiaIndex(dia);
                if (diaIndex !== -1) {
                    if (!programacion[diaIndex]) programacion[diaIndex] = [];
                    
                    const contenidoSugerido = this.generarContenidoParaPlataforma(platform);
                    programacion[diaIndex].push({
                        platform: platform,
                        content: contenidoSugerido,
                        time: hora
                    });
                }
            });
        });

        return programacion;
    }

    getDiaIndex(dia) {
        const dias = {
            'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3, 
            'Viernes': 4, 'Sábado': 5, 'Domingo': 6
        };
        return dias[dia] !== undefined ? dias[dia] : -1;
    }

    generarContenidoParaPlataforma(platform) {
        // Obtener tareas completadas recientemente para generar contenido relevante
        const tareasRecientes = this.datos.tareas
            .filter(t => t.progreso > 0)
            .slice(0, 3);

        const contenidoBase = {
            instagram: [
                `Time-lapse del ${tareasRecientes[0]?.nombre || 'patrón actual'}`,
                'Tips de ergonomía para bordar con fibromialgia',
                'Stories: progreso del día con estado de salud',
                'Foto del espacio de bordado',
                'Combinación de colores del día'
            ],
            youtube: [
                `Tutorial: ${tareasRecientes[0]?.nombre || 'Técnica básica de Bargello'}`,
                'Bordado terapéutico para condiciones crónicas',
                'Historia del Bargello y técnicas tradicionales',
                'Q&A: Preguntas de la comunidad'
            ],
            facebook: [
                'Actualización semanal del progreso del taller',
                'Compartir logros de la comunidad',
                'Post educativo sobre beneficios del bordado',
                'Reflexión sobre bordado consciente'
            ],
            tiktok: [
                'Transformación antes/después en 60 segundos',
                'Técnica rápida de corrección de errores',
                'Bordado mientras manejo fibromialgia',
                'Colores que mejoran el estado de ánimo'
            ],
            pinterest: [
                `Infografía: ${tareasRecientes[0]?.nombre || 'Patrón completado'}`,
                'Tablero de inspiración cromática',
                'Guía visual de herramientas',
                'Espacios de bordado adaptativos'
            ]
        };

        const opciones = contenidoBase[platform] || ['Contenido personalizado'];
        return opciones[Math.floor(Math.random() * opciones.length)];
    }

    renderizarSugerenciasContenido(container) {
        const hoy = new Date().toISOString().split('T')[0];
        const registroHoy = this.datos.salud.find(r => r.fecha === hoy);
        const tareasHoy = this.datos.tareas.filter(t => 
            t.fecha_inicio <= hoy && t.fecha_limite >= hoy && t.estado !== 'completado'
        );

        container.innerHTML = `
            <h3>Sugerencias de Contenido Personalizadas</h3>
            <div class="social-suggestions">
                ${Object.entries(this.datos.redes_sociales).map(([platform, config]) => `
                    <div class="platform-suggestion">
                        <h4>${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
                        <div class="connection-status ${config.connected ? 'connected' : 'disconnected'}">
                            ${config.connected ? '✅ Conectado' : '❌ No conectado'}
                            <button class="btn btn--sm connect-social-btn" data-platform="${platform}">
                                ${config.connected ? 'Configurar' : 'Conectar'}
                            </button>
                        </div>
                        <p><strong>Frecuencia:</strong> ${config.frecuencia}</p>
                        <div class="content-suggestions">
                            <h5>Sugerencias para hoy:</h5>
                            <ul>
                                ${this.generarSugerenciasEspecificas(platform, registroHoy, tareasHoy).map(sugerencia => 
                                    `<li>${sugerencia}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarSugerenciasEspecificas(platform, registroSalud, tareasHoy) {
        const sugerencias = [];
        
        // Sugerencias basadas en salud
        if (registroSalud) {
            if (registroSalud.dolor >= 7) {
                sugerencias.push(`Compartir técnicas de bordado para días de dolor alto`);
            }
            if (registroSalud.fatiga >= 7) {
                sugerencias.push(`Mostrar adaptaciones para días de fatiga severa`);
            }
            if (registroSalud.dolor <= 4 && registroSalud.fatiga <= 4) {
                sugerencias.push(`Time-lapse de progreso en día de buena energía`);
            }
        }

        // Sugerencias basadas en tareas actuales
        if (tareasHoy.length > 0) {
            const tareaActual = tareasHoy[0];
            if (platform === 'instagram') {
                sugerencias.push(`Foto del ${tareaActual.nombre} en progreso`);
                sugerencias.push(`Stories mostrando el proceso paso a paso`);
            } else if (platform === 'youtube') {
                sugerencias.push(`Tutorial detallado: ${tareaActual.nombre}`);
            } else if (platform === 'pinterest') {
                sugerencias.push(`Pin con el patrón de ${tareaActual.nombre}`);
            }
        }

        // Sugerencias por defecto si no hay específicas
        if (sugerencias.length === 0) {
            const defaultContent = {
                instagram: ['Foto de tu espacio de bordado', 'Tip rápido en Stories'],
                youtube: ['Video educativo sobre Bargello', 'Respuesta a preguntas de seguidores'],
                facebook: ['Reflexión sobre bordado terapéutico', 'Compartir progreso semanal'],
                tiktok: ['Video corto de técnica', 'Antes y después de proyecto'],
                pinterest: ['Infografía de colores', 'Tablero de inspiración']
            };
            sugerencias.push(...(defaultContent[platform] || ['Contenido personalizado']));
        }

        return sugerencias.slice(0, 3);
    }

    conectarRedSocial(platform) {
        // Simulación de conexión a red social
        const apiKey = prompt(`Ingresa tu API key para ${platform}:`);
        if (apiKey) {
            this.datos.redes_sociales[platform].apiKey = apiKey;
            this.datos.redes_sociales[platform].connected = true;
            this.guardarDatos();
            this.mostrarNotificacion(`${platform} conectado correctamente`, 'success');
            this.renderizarCalendarioSocial();
        }
    }

    getInicioSemana(fecha) {
        const dia = fecha.getDay();
        const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes como primer día
        return new Date(fecha.setDate(diff));
    }

    // Timeline y Cronograma
    renderizarTimeline() {
        const container = document.getElementById('timelineContainer');
        if (!container) return;

        const currentWeekEl = document.getElementById('currentWeek');
        if (currentWeekEl) {
            currentWeekEl.textContent = `Semana del ${this.currentWeek.toLocaleDateString()}`;
        }

        const inicioSemana = this.getInicioSemana(new Date(this.currentWeek));
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        const tareasSemanales = this.obtenerTareasSemanales(inicioSemana);

        const timelineGrid = document.getElementById('timelineGrid');
        if (timelineGrid) {
            timelineGrid.innerHTML = diasSemana.map((dia, index) => {
                const fecha = new Date(inicioSemana);
                fecha.setDate(fecha.getDate() + index);
                const tareasDia = tareasSemanales[index] || [];
                
                return `
                    <div class="timeline-day">
                        <h4>${dia} ${fecha.getDate()}</h4>
                        <div class="day-tasks">
                            ${tareasDia.map(tarea => `
                                <div class="timeline-task" data-task-id="${tarea.id}" 
                                     style="background-color: ${this.getColorByModule(tarea.modulo)}">
                                    <div class="task-title">${tarea.nombre}</div>
                                    <div class="task-duration">${tarea.duracion_estimada}h</div>
                                    <div class="task-progress-mini">${tarea.progreso}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    obtenerTareasSemanales(inicioSemana) {
        const tareasSemanales = {};
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(inicioSemana);
            fecha.setDate(fecha.getDate() + i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            tareasSemanales[i] = this.datos.tareas.filter(tarea => {
                return (tarea.fecha_inicio <= fechaStr && tarea.fecha_limite >= fechaStr) &&
                       tarea.estado !== 'completado';
            });
        }

        return tareasSemanales;
    }

    getColorByModule(modulo) {
        const colors = {
            '0': '#FF6B6B', '1': '#4ECDC4', '2': '#45B7D1', '3': '#96CEB4',
            '4': '#FFEAA7', '5': '#DDA0DD', '6': '#98D8C8', '7': '#F7DC6F',
            '8': '#BB8FCE', '9': '#85C1E9', '10': '#F8C471', '11': '#82E0AA',
            '12': '#F1948A', '13': '#AED6F1'
        };
        return colors[modulo] || '#BDC3C7';
    }

    cambiarSemana(direccion) {
        const nuevaFecha = new Date(this.currentWeek);
        nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
        this.currentWeek = nuevaFecha;
        this.renderizarTimeline();
    }

    // Dashboard principal
    actualizarDashboard() {
        this.actualizarEstadisticasDashboard();
        this.renderizarGraficos();
        this.actualizarEstadoSalud();
    }

    actualizarEstadisticasDashboard() {
        const totalTareas = this.datos.tareas.length;
        const completadas = this.datos.tareas.filter(t => t.estado === 'completado').length;
        const enProgreso = this.datos.tareas.filter(t => t.estado === 'en progreso').length;
        const pendientes = this.datos.tareas.filter(t => t.estado === 'pendiente').length;

        // Actualizar estadísticas si existen elementos
        const elements = {
            'totalTasks': totalTareas,
            'completedTasks': completadas,
            'inProgressTasks': enProgreso,
            'pendingTasks': pendientes
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        // Actualizar progreso general
        const progressGeneral = totalTareas > 0 ? (completadas / totalTareas) * 100 : 0;
        const progressBar = document.getElementById('generalProgress');
        if (progressBar) {
            progressBar.style.width = `${progressGeneral}%`;
        }
    }

    // Gráficos
    renderizarGraficos() {
        this.renderizarGraficoSalud();
        this.renderizarGraficoProgreso();
    }

    renderizarGraficoSalud() {
        const canvas = document.getElementById('healthChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this.healthChart) {
            this.healthChart.destroy();
        }

        const ultimos7Dias = this.datos.salud.slice(-7);
        
        this.healthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ultimos7Dias.map(d => new Date(d.fecha).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Dolor',
                        data: ultimos7Dias.map(d => d.dolor),
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Fatiga',
                        data: ultimos7Dias.map(d => d.fatiga),
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Sueño',
                        data: ultimos7Dias.map(d => d.sueño),
                        borderColor: '#45B7D1',
                        backgroundColor: 'rgba(69, 183, 209, 0.1)',
                        tension: 0.1
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
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    renderizarGraficoProgreso() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this.progressChart) {
            this.progressChart.destroy();
        }

        // Agrupar tareas por módulo
        const tareasPorModulo = {};
        this.datos.tareas.forEach(tarea => {
            if (!tareasPorModulo[tarea.modulo]) {
                tareasPorModulo[tarea.modulo] = [];
            }
            tareasPorModulo[tarea.modulo].push(tarea);
        });

        const labels = Object.keys(tareasPorModulo).sort().map(m => `Módulo ${m}`);
        const data = Object.keys(tareasPorModulo).sort().map(modulo => {
            const tareas = tareasPorModulo[modulo];
            const promedioProgreso = tareas.reduce((sum, t) => sum + t.progreso, 0) / tareas.length;
            return promedioProgreso;
        });

        this.progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Progreso (%)',
                    data: data,
                    backgroundColor: labels.map((_, index) => this.getColorByModule(index.toString())),
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
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Gestión de datos
    guardarDatos() {
        try {
            localStorage.setItem('bargelloDashboard', JSON.stringify(this.datos));
            localStorage.setItem('lastSave', new Date().toISOString());
        } catch (e) {
            console.error('Error guardando datos:', e);
            this.mostrarNotificacion('Error al guardar datos', 'error');
        }
    }

    abrirCargadorCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.cargarCSV(file);
            }
        };
        
        input.click();
    }

    cargarCSV(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                const nuevasTareas = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const values = this.parseCSVLine(line);
                    if (values.length !== headers.length) continue;
                    
                    const tarea = {};
                    headers.forEach((header, index) => {
                        tarea[header] = values[index];
                    });
                    
                    // Convertir tipos apropiados
                    if (tarea.id) tarea.id = parseInt(tarea.id) || Date.now() + i;
                    if (tarea.duracion_estimada) tarea.duracion_estimada = parseInt(tarea.duracion_estimada) || 1;
                    if (tarea.progreso) tarea.progreso = parseInt(tarea.progreso) || 0;
                    
                    nuevasTareas.push(tarea);
                }
                
                if (nuevasTareas.length > 0) {
                    this.datos.tareas = nuevasTareas;
                    this.guardarDatos();
                    this.renderizarTareas();
                    this.poblarFiltroModulos();
                    this.actualizarDashboard();
                    this.mostrarNotificacion(`${nuevasTareas.length} tareas cargadas desde CSV`, 'success');
                } else {
                    this.mostrarNotificacion('No se encontraron tareas válidas en el CSV', 'warning');
                }
                
            } catch (error) {
                console.error('Error procesando CSV:', error);
                this.mostrarNotificacion('Error al procesar el archivo CSV', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values.map(v => v.replace(/^"|"$/g, ''));
    }

    abrirCargadorMD() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.cargarArchivosMarkdownSubidos(files);
        };
        
        input.click();
    }

    cargarArchivosMarkdownSubidos(files) {
        let archivoscargados = 0;
        
        files.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const contenido = e.target.result;
                const nombre = file.name;
                
                // Verificar si ya existe
                const existingIndex = this.datos.archivos_md.findIndex(a => a.nombre === nombre);
                
                const archivo = {
                    nombre: nombre,
                    titulo: this.extraerTituloMarkdown(contenido),
                    contenido: contenido
                };
                
                if (existingIndex !== -1) {
                    this.datos.archivos_md[existingIndex] = archivo;
                } else {
                    this.datos.archivos_md.push(archivo);
                }
                
                archivoscargados++;
                
                if (archivoscargados === files.length) {
                    this.guardarDatos();
                    this.actualizarListaArchivosMarkdown();
                    this.mostrarNotificacion(`${archivoscargados} archivos MD cargados`, 'success');
                }
            };
            
            reader.readAsText(file);
        });
    }

    exportarCSV() {
        const headers = [
            'id', 'nombre', 'descripcion', 'modulo', 'seccion', 
            'fecha_inicio', 'fecha_limite', 'duracion_estimada', 
            'dependencias', 'prioridad', 'progreso', 'estado', 
            'responsable', 'notas', 'archivo_md'
        ];
        
        let csv = headers.join(',') + '\n';
        
        this.datos.tareas.forEach(tarea => {
            const row = headers.map(header => {
                let value = tarea[header] || '';
                // Escapar comillas y envolver en comillas si contiene comas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv += row.join(',') + '\n';
        });
        
        // Crear y descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bargello_tareas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarNotificacion('CSV exportado correctamente', 'success');
    }

    sincronizarDatos() {
        // Simulación de sincronización
        this.guardarDatos();
        
        // Actualizar timestamp de sincronización
        localStorage.setItem('lastSync', new Date().toISOString());
        
        this.mostrarNotificacion('Datos sincronizados correctamente', 'success');
        
        // Actualizar UI de última sincronización
        const lastSyncEl = document.getElementById('lastSync');
        if (lastSyncEl) {
            lastSyncEl.textContent = new Date().toLocaleString();
        }
    }

    configurarSincronizacionAutomatica() {
        if (this.datos.configuracion.sincronizacion_automatica) {
            // Guardar datos cada 5 minutos
            setInterval(() => {
                this.guardarDatos();
            }, 5 * 60 * 1000);
        }
    }

    configurarNotificaciones() {
        // Solicitar permiso para notificaciones
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear contenedor de notificaciones si no existe
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications';
            document.body.appendChild(container);
        }

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;

        container.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Notificación del navegador si está permitida
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Bargello Dashboard', {
                body: mensaje,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧵</text></svg>'
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está disponible. Los gráficos no se mostrarán.');
        // Crear Chart mock para evitar errores
        window.Chart = class {
            constructor() {}
            destroy() {}
        };
    }

    // Inicializar dashboard
    window.bargelloDashboard = new BargelloDashboard();
});

// Funciones globales para compatibilidad
window.loadCSVFile = function() {
    if (window.bargelloDashboard) {
        window.bargelloDashboard.abrirCargadorCSV();
    }
};

window.exportTasks = function() {
    if (window.bargelloDashboard) {
        window.bargelloDashboard.exportarCSV();
    }
};

window.loadMDFiles = function() {
    if (window.bargelloDashboard) {
        window.bargelloDashboard.abrirCargadorMD();
    }
};

// Service Worker para funcionalidad offline (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registro fallido: ', registrationError);
            });
    });
}
