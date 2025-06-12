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
        this.timerDescanso = null;
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
        this.iniciarNotificacionesDescanso(); // Llama aquí el sistema de descansos
    }

    cargarDatosIniciales() {
        const datosGuardados = localStorage.getItem('bargelloDashboard');
        if (datosGuardados) {
            this.datos = JSON.parse(datosGuardados);
        } else {
            this.datos = {
                tareas: [],
                salud: this.generarHistorialSalud(),
                archivos_md: [],
                redes_sociales: {}
            };
            this.guardarDatos();
        }
    }

    guardarDatos() {
        localStorage.setItem('bargelloDashboard', JSON.stringify(this.datos));
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
        // Ejemplo: listeners para navegación, formularios, sliders, etc.
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.cambiarVista(view);
            });
        });
        document.getElementById('healthForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarSalud();
        });
        ['dolorSlider', 'fatigaSlider', 'suenoSlider'].forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id.replace('Slider', 'Value'));
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
            });
        });
        // ...otros listeners para tareas, markdown, filtros, etc.
    }

    inicializarVistas() {
        this.cambiarVista('dashboard');
        this.poblarFiltroModulos();
        this.renderizarGraficos();
        this.renderizarTimeline();
        this.renderizarCalendarioSocial();
    }

    cambiarVista(vista) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${vista}-view`).classList.add('active');
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === vista) {
                link.classList.add('active');
            }
        });
        this.currentView = vista;
        switch (vista) {
            case 'dashboard': this.actualizarDashboard(); break;
            case 'salud': this.actualizarVistasSalud(); break;
            case 'tareas': this.renderizarTareas(); break;
            case 'timeline': this.renderizarTimeline(); break;
            case 'markdown': this.actualizarListaArchivosMarkdown(); break;
            case 'redes': this.renderizarCalendarioSocial(); break;
        }
    }

        // --- GESTIÓN DE SALUD ---
    registrarSalud() {
        const dolor = parseInt(document.getElementById('dolorSlider').value);
        const fatiga = parseInt(document.getElementById('fatigaSlider').value);
        const sueño = parseInt(document.getElementById('suenoSlider').value);
        const hoy = new Date().toISOString().split('T')[0];
        const indiceExistente = this.datos.salud.findIndex(registro => registro.fecha === hoy);
        const nuevoRegistro = { fecha: hoy, dolor, fatiga, sueño, horas_trabajadas: 0 };
        if (indiceExistente !== -1) {
            this.datos.salud[indiceExistente] = nuevoRegistro;
        } else {
            this.datos.salud.push(nuevoRegistro);
        }
        this.datos.salud = this.datos.salud.slice(-30);
        this.guardarDatos();
        this.actualizarEstadoSalud();
        this.renderizarGraficoSalud && this.renderizarGraficoSalud();
        this.mostrarNotificacion && this.mostrarNotificacion('Registro de salud guardado', 'success');
        this.calcularRecomendaciones(dolor, fatiga, sueño);
        this.iniciarNotificacionesDescanso && this.iniciarNotificacionesDescanso();
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
            tareasSugeridas = this.datos.tareas.filter(t => t.duracion_estimada <= 2 && t.estado !== 'completado').slice(0, 2);
        } else if (capacidad <= 5) {
            recomendacion = 'Capacidad moderada - Documentación y lectura';
            tareasSugeridas = this.datos.tareas.filter(t => t.duracion_estimada <= 4 && t.estado !== 'completado').slice(0, 3);
        } else if (capacidad <= 6) {
            recomendacion = 'Buen día - Trabajo moderado incluyendo bordado';
            tareasSugeridas = this.datos.tareas.filter(t => t.duracion_estimada <= 8 && t.estado !== 'completado').slice(0, 4);
        } else {
            recomendacion = 'Excelente capacidad - Día completo de trabajo';
            tareasSugeridas = this.datos.tareas.filter(t => t.estado !== 'completado').slice(0, 5);
        }
        document.getElementById('workCapacity').innerHTML = `
            <strong>${recomendacion}</strong>
            <ul>
                ${tareasSugeridas.map(t => `<li>${t.nombre} (${t.duracion_estimada}h)</li>`).join('')}
            </ul>
        `;
    }

    actualizarEstadoSalud() {
        const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
        if (ultimoRegistro) {
            document.getElementById('dolorSlider').value = ultimoRegistro.dolor;
            document.getElementById('fatigaSlider').value = ultimoRegistro.fatiga;
            document.getElementById('suenoSlider').value = ultimoRegistro.sueño;
            document.getElementById('dolorValue').textContent = ultimoRegistro.dolor;
            document.getElementById('fatigaValue').textContent = ultimoRegistro.fatiga;
            document.getElementById('suenoValue').textContent = ultimoRegistro.sueño;
        }
        this.renderizarGraficoSalud && this.renderizarGraficoSalud();
    }

    // --- GESTIÓN DE TAREAS ---
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
            const index = this.datos.tareas.findIndex(t => t.id === this.editingTaskId);
            tarea.id = this.editingTaskId;
            this.datos.tareas[index] = tarea;
            this.mostrarNotificacion && this.mostrarNotificacion('Tarea actualizada', 'success');
        } else {
            tarea.id = Date.now();
            this.datos.tareas.push(tarea);
            this.mostrarNotificacion && this.mostrarNotificacion('Tarea creada', 'success');
        }
        this.guardarDatos();
        this.renderizarTareas && this.renderizarTareas();
        this.cerrarModalTarea();
        this.actualizarDashboard && this.actualizarDashboard();
    }

    eliminarTarea(taskId) {
        if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
            this.datos.tareas = this.datos.tareas.filter(t => t.id !== taskId);
            this.guardarDatos();
            this.renderizarTareas && this.renderizarTareas();
            this.mostrarNotificacion && this.mostrarNotificacion('Tarea eliminada', 'success');
            this.actualizarDashboard && this.actualizarDashboard();
        }
    }

    // --- GESTIÓN DE MARKDOWN ---
    async cargarArchivosMarkdown() {
        // Aquí puedes implementar la carga dinámica de archivos .md si lo deseas
        // Por defecto, se usan los archivos_md en this.datos.archivos_md
    }

    actualizarListaArchivosMarkdown() {
        // Aquí puedes actualizar la lista de archivos markdown en la UI
    }

        // --- SISTEMA DE NOTIFICACIONES ADAPTATIVAS PARA FIBROMIALGIA ---
    iniciarNotificacionesDescanso() {
        const ultimo = this.datos.salud && this.datos.salud.length > 0
            ? this.datos.salud[this.datos.salud.length - 1]
            : null;
        if (!ultimo) return;

        let intervalo = 45;
        if (ultimo.dolor >= 7 || ultimo.fatiga >= 7) intervalo = 20;
        else if (ultimo.dolor >= 5 || ultimo.fatiga >= 5) intervalo = 30;

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (this.timerDescanso) clearTimeout(this.timerDescanso);

        this.timerDescanso = setTimeout(() => {
            this.mostrarNotificacionDescanso(intervalo);
        }, intervalo * 60 * 1000);
    }

    mostrarNotificacionDescanso(intervalo) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('¡Tómate un descanso!', {
                body: `Por tu estado de salud, te recomendamos descansar ahora.`,
                icon: '/favicon.ico'
            });
        }
        this.mostrarNotificacion(
            `¡Tómate un descanso!`,
            `Por tu estado de salud, es recomendable tomar un descanso ahora. Próxima alerta en ${intervalo} minutos.`,
            'info'
        );
        this.iniciarNotificacionesDescanso();
    }

    mostrarNotificacion(titulo, mensaje, tipo = 'info') {
        // Implementa aquí tu sistema visual de notificaciones o usa alert como fallback:
        alert(`${titulo}\n${mensaje}`);
    }
}

// Inicialización global fuera de la clase
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new BargelloDashboard();
});

}
