class BargelloDashboard {
    constructor() {
        // Estructura de datos principal
        this.datos = {
            tareas: [],
            salud: [],
            archivos_md: [],
            redes_sociales: {}
        };
        
        // Variables de control
        this.currentView = 'dashboard';
        this.editingTaskId = null;
        this.currentWeek = new Date();
        
        // Inicialización
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
        
        // Configurar sistema de descansos para fibromialgia
        this.iniciarSistemaDescansos();
    }
}

cargarDatosIniciales() {
    // Intentar cargar datos guardados desde localStorage
    const datosGuardados = localStorage.getItem('bargelloDashboard');
    
    if (datosGuardados) {
        this.datos = JSON.parse(datosGuardados);
    } else {
        // Datos iniciales de ejemplo
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
                // Más tareas de ejemplo...
            ],
            salud: this.generarHistorialSalud(),
            archivos_md: [
                {
                    nombre: "modulo-0-punto-1.md",
                    titulo: "Video de Bienvenida y Filosofía del Taller",
                    contenido: "# Módulo 0 - Punto 1: Video de Bienvenida\n\n## Objetivos\n- Presentar la filosofía del taller\n- Explicar la historia del Bargello\n- Establecer expectativas del curso"
                },
                // Más archivos MD...
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
    
    // Generar 30 días de historial de ejemplo
    for (let i = 29; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        
        historial.push({
            fecha: fecha.toISOString().split('T')[0],
            dolor: Math.floor(Math.random() * 4) + 4,    // 4-7 nivel de dolor
            fatiga: Math.floor(Math.random() * 4) + 5,   // 5-8 nivel de fatiga
            sueño: Math.floor(Math.random() * 4) + 5,    // 5-8 horas de sueño
            horas_trabajadas: Math.floor(Math.random() * 5) + 2  // 2-6 horas trabajadas
        });
    }
    
    return historial;
}

registrarSalud() {
    const dolor = parseInt(document.getElementById('dolorSlider').value);
    const fatiga = parseInt(document.getElementById('fatigaSlider').value);
    const sueño = parseInt(document.getElementById('suenoSlider').value);
    const hoy = new Date().toISOString().split('T')[0];
    
    // Crear nuevo registro de salud
    const nuevoRegistro = {
        fecha: hoy,
        dolor,
        fatiga,
        sueño,
        horas_trabajadas: 0  // Se actualizará durante el día
    };
    
    // Buscar si ya existe registro de hoy
    const indiceExistente = this.datos.salud.findIndex(registro => registro.fecha === hoy);
    
    if (indiceExistente !== -1) {
        this.datos.salud[indiceExistente] = nuevoRegistro;
    } else {
        this.datos.salud.push(nuevoRegistro);
    }
    
    // Mantener solo últimos 30 días
    this.datos.salud = this.datos.salud.slice(-30);
    
    // Guardar en localStorage
    this.guardarDatos();
    
    // Actualizar interfaz
    this.actualizarEstadoSalud();
    this.renderizarGraficoSalud();
    this.mostrarNotificacion('Registro de salud guardado', 'success');
    
    // Calcular y mostrar recomendaciones
    this.calcularRecomendaciones(dolor, fatiga, sueño);
}

iniciarSistemaDescansos() {
    // Obtener último registro de salud
    const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
    
    if (ultimoRegistro) {
        const { dolor, fatiga } = ultimoRegistro;
        
        // Calcular intervalo de descanso basado en niveles de dolor y fatiga
        const intervaloMinutos = this.calcularIntervaloDescanso(dolor, fatiga);
        
        // Programar próxima notificación de descanso
        this.programarDescanso(intervaloMinutos);
    }
}

calcularIntervaloDescanso(dolor, fatiga) {
    // Base: 45 minutos entre descansos
    let intervaloBase = 45;
    
    // Ajustar según nivel de dolor (1-10)
    if (dolor >= 7) intervaloBase = 20;
    else if (dolor >= 5) intervaloBase = 30;
    else if (dolor >= 3) intervaloBase = 40;
    
    // Ajustar según fatiga (1-10)
    if (fatiga >= 7) intervaloBase -= 10;
    else if (fatiga >= 5) intervaloBase -= 5;
    
    // Garantizar mínimo 15 minutos entre descansos
    return Math.max(15, intervaloBase);
}

programarDescanso(minutos) {
    // Limpiar temporizador anterior si existe
    if (this.timerDescanso) {
        clearTimeout(this.timerDescanso);
    }
    
    // Programar próximo descanso
    this.timerDescanso = setTimeout(() => {
        this.mostrarNotificacionDescanso();
    }, minutos * 60 * 1000);
}

mostrarNotificacionDescanso() {
    // Crear y mostrar modal de descanso
    const modal = document.createElement('div');
    modal.className = 'modal-descanso';
    modal.innerHTML = `
        <div class="modal-contenido">
            <h3>¡Tiempo de Descanso! 🌸</h3>
            <p>Has trabajado suficiente. Toma un descanso para cuidar tu salud.</p>
            <button id="cerrarDescanso" class="btn btn--primary">Entendido</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar cierre del modal
    document.getElementById('cerrarDescanso').addEventListener('click', () => {
        modal.remove();
        
        // Programar próximo descanso
        const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
        if (ultimoRegistro) {
            this.programarDescanso(this.calcularIntervaloDescanso(ultimoRegistro.dolor, ultimoRegistro.fatiga));
        }
    });
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
    
    // Cierre de modales
    document.getElementById('closeTaskModal').addEventListener('click', () => this.cerrarModalTarea());
    document.getElementById('cancelTask').addEventListener('click', () => this.cerrarModalTarea());
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
            this.cerrarModalTarea();
        }
    });
}

guardarDatos() {
    localStorage.setItem('bargelloDashboard', JSON.stringify(this.datos));
}

mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    const contenedor = document.querySelector('.notifications') || document.createElement('div');
    
    if (!document.querySelector('.notifications')) {
        contenedor.className = 'notifications';
        document.body.appendChild(contenedor);
    }
    
    contenedor.appendChild(notificacion);
    
    // Mostrar notificación con animación
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

calcularCapacidadTrabajo(dolor, fatiga, sueño) {
    let baseHoras = 7; // Jornada estándar
    let reduccionDolor = dolor > 6 ? (dolor - 6) * 0.5 : 0;
    let reduccionFatiga = fatiga > 5 ? (fatiga - 5) * 0.3 : 0;
    let bonusSueño = sueño > 7 ? 0.2 : (sueño < 5 ? -0.5 : 0);
    
    return Math.max(2, baseHoras - reduccionDolor - reduccionFatiga + bonusSueño);
}

renderizarTareas() {
    const tbody = document.getElementById('tasksTableBody');
    const tareasFiltradas = this.filtrarTareasArray();
    
    tbody.innerHTML = tareasFiltradas.map(tarea => `
        <tr>
            <td>${tarea.nombre}</td>
            <td>Módulo ${tarea.modulo}</td>
            <td>${tarea.estado}</td>
            <td>
                <div class="task-progress">
                    <input type="range" min="0" max="100" value="${tarea.progreso}" 
                           onchange="dashboard.actualizarProgreso(${tarea.id}, this.value)">
                    <span>${tarea.progreso}%</span>
                </div>
            </td>
            <td>${tarea.fecha_limite}</td>
            <td><span class="priority-${tarea.prioridad}">${tarea.prioridad}</span></td>
            <td class="task-actions">
                <button onclick="dashboard.abrirModalTarea(${tarea.id})" class="btn btn--sm btn--secondary">✏️</button>
                <button onclick="dashboard.eliminarTarea(${tarea.id})" class="btn btn--sm btn--secondary">🗑️</button>
                <button onclick="dashboard.moverTareaHoy(${tarea.id})" class="btn btn--sm btn--secondary">📅</button>
            </td>
        </tr>
    `).join('');
}

filtrarTareas() {
    const busqueda = document.getElementById('searchTasks').value.toLowerCase();
    const modulo = document.getElementById('filterModule').value;
    const estado = document.getElementById('filterStatus').value;
    
    this.renderizarTareas();
}

filtrarTareasArray() {
    const busqueda = document.getElementById('searchTasks')?.value.toLowerCase() || '';
    const modulo = document.getElementById('filterModule')?.value || '';
    const estado = document.getElementById('filterStatus')?.value || '';
    
    return this.datos.tareas.filter(tarea => {
        const coincideBusqueda = busqueda === '' || 
            tarea.nombre.toLowerCase().includes(busqueda) || 
            tarea.descripcion.toLowerCase().includes(busqueda);
            
        const coincideModulo = modulo === '' || tarea.modulo === modulo;
        const coincideEstado = estado === '' || tarea.estado === estado;
        
        return coincideBusqueda && coincideModulo && coincideEstado;
    });
}

actualizarProgreso(taskId, progreso) {
    const tarea = this.datos.tareas.find(t => t.id === taskId);
    if (tarea) {
        tarea.progreso = parseInt(progreso);
        
        // Actualizar estado automáticamente según progreso
        if (tarea.progreso === 100) {
            tarea.estado = 'completado';
        } else if (tarea.progreso > 0) {
            tarea.estado = 'en progreso';
        }
        
        this.guardarDatos();
        this.renderizarTareas();
        this.actualizarDashboard();
    }
}

moverTareaHoy(taskId) {
    const tarea = this.datos.tareas.find(t => t.id === taskId);
    if (tarea) {
        const hoy = new Date().toISOString().split('T')[0];
        tarea.fecha_inicio = hoy;
        
        this.guardarDatos();
        this.mostrarNotificacion(`Tarea "${tarea.nombre}" movida para hoy`, 'success');
        this.renderizarTareas();
        this.renderizarTimeline();
    }
}

renderizarTimeline() {
    const container = document.getElementById('timelineGrid');
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // Obtener inicio de la semana actual
    const inicioSemana = this.getInicioSemana(this.currentWeek);
    
    // Actualizar encabezado de semana
    document.getElementById('currentWeekDisplay').textContent = 
        `${inicioSemana.toLocaleDateString()} - ${new Date(inicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
    
    // Generar grid de días
    container.innerHTML = diasSemana.map((dia, index) => {
        const fecha = new Date(inicioSemana);
        fecha.setDate(fecha.getDate() + index);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        // Filtrar tareas para este día
        const tareasDia = this.datos.tareas.filter(t => 
            t.fecha_inicio === fechaStr || 
            (new Date(t.fecha_inicio) <= fecha && new Date(t.fecha_limite) >= fecha)
        );
        
        return `
            <div class="timeline-day">
                <h4>${dia} ${fecha.getDate()}/${fecha.getMonth() + 1}</h4>
                ${tareasDia.map(t => `
                    <div class="timeline-task" onclick="dashboard.abrirModalTarea(${t.id})">
                        ${t.nombre.length > 20 ? t.nombre.substring(0, 20) + '...' : t.nombre}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

getInicioSemana(fecha) {
    const nuevaFecha = new Date(fecha);
    const diaSemana = nuevaFecha.getDay();
    const diff = nuevaFecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    nuevaFecha.setDate(diff);
    return nuevaFecha;
}

cambiarSemana(direccion) {
    const nuevaFecha = new Date(this.currentWeek);
    nuevaFecha.setDate(nuevaFecha.getDate() + direccion * 7);
    this.currentWeek = nuevaFecha;
    this.renderizarTimeline();
}

cargarArchivosMarkdown() {
    const select = document.getElementById('mdFileSelect');
    
    // Limpiar opciones existentes
    select.innerHTML = '';
    
    // Agregar opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccionar archivo...';
    select.appendChild(defaultOption);
    
    // Agregar opciones de archivos
    this.datos.archivos_md.forEach(archivo => {
        const option = document.createElement('option');
        option.value = archivo.nombre;
        option.textContent = archivo.titulo || archivo.nombre;
        select.appendChild(option);
    });
    
    // Limpiar editor
    document.getElementById('markdownEditor').value = '';
    document.getElementById('markdownPreview').innerHTML = '';
}

cargarArchivoMarkdown(nombreArchivo) {
    if (!nombreArchivo) return;
    
    const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
    if (archivo) {
        document.getElementById('markdownEditor').value = archivo.contenido;
        document.getElementById('markdownPreview').innerHTML = marked.parse(archivo.contenido);
    }
}

cambiarTabMarkdown(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.getElementById('markdownEditor').style.display = tab === 'edit' ? 'block' : 'none';
    document.getElementById('markdownPreview').style.display = tab === 'preview' ? 'block' : 'none';
    
    if (tab === 'preview') {
        const contenido = document.getElementById('markdownEditor').value;
        document.getElementById('markdownPreview').innerHTML = marked.parse(contenido);
    }
}

renderizarCalendarioSocial() {
    const calendar = document.getElementById('socialCalendar');
    const suggestions = document.getElementById('contentSuggestions');
    
    // Generar calendario simple para la semana actual
    const hoy = new Date();
    const inicioSemana = this.getInicioSemana(hoy);
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    // Contenido programado basado en configuración
    const contenidoProgramado = {
        1: ['Instagram: Foto de progreso'], // Lunes
        3: ['YouTube: Tutorial semanal'],   // Miércoles
        4: ['Instagram: Stories con tips']  // Jueves
    };
    
    calendar.innerHTML = diasSemana.map((dia, index) => {
        const fecha = new Date(inicioSemana);
        fecha.setDate(fecha.getDate() + index);
        const contenido = contenidoProgramado[index] || [];
        
        return `
            <div class="calendar-day">
                <div class="calendar-day-header">${dia} ${fecha.getDate()}/${fecha.getMonth() + 1}</div>
                ${contenido.map(post => `<div class="social-post">${post}</div>`).join('')}
            </div>
        `;
    }).join('');
    
    // Generar sugerencias de contenido basadas en tareas actuales
    const tareasActuales = this.datos.tareas.filter(t => t.progreso > 0 && t.progreso < 100);
    
    if (tareasActuales.length > 0) {
        const sugerencias = {
            instagram: [
                `Time-lapse del bordado "${tareasActuales[0].nombre}"`,
                `Foto de detalle del patrón "${tareasActuales[0].nombre}"`,
                `Stories mostrando el proceso de selección de colores`
            ],
            youtube: [
                `Tutorial completo: Cómo bordar el patrón "${tareasActuales[0].nombre}"`,
                `Tips para resolver problemas comunes en el módulo ${tareasActuales[0].modulo}`,
                `Explicación de la historia detrás del patrón "${tareasActuales[0].nombre}"`
            ],
            pinterest: [
                `Infografía: Pasos para completar el patrón "${tareasActuales[0].nombre}"`,
                `Tablero de inspiración: Variaciones de color para el módulo ${tareasActuales[0].modulo}`,
                `Guía visual: Materiales necesarios para el patrón "${tareasActuales[0].nombre}"`
            ]
        };
        
        suggestions.innerHTML = `
            <div class="card">
                <div class="card__header">
                    <h4>Instagram</h4>
                </div>
                <div class="card__body">
                    <ul>
                        ${sugerencias.instagram.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="card">
                <div class="card__header">
                    <h4>YouTube</h4>
                </div>
                <div class="card__body">
                    <ul>
                        ${sugerencias.youtube.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="card">
                <div class="card__header">
                    <h4>Pinterest</h4>
                </div>
                <div class="card__body">
                    <ul>
                        ${sugerencias.pinterest.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    } else {
        suggestions.innerHTML = `
            <div class="card">
                <div class="card__body">
                    <p>No hay tareas en progreso para generar sugerencias personalizadas.</p>
                </div>
            </div>
        `;
    }
}

exportarCSV() {
    // Convertir datos a formato CSV
    const headers = [
        'id', 'nombre', 'descripcion', 'modulo', 'seccion', 
        'fecha_inicio', 'fecha_limite', 'duracion_estimada', 
        'dependencias', 'prioridad', 'progreso', 'estado', 
        'responsable', 'notas', 'archivo_md'
    ];
    
    let csv = headers.join(',') + '\n';
    
    this.datos.tareas.forEach(tarea => {
        const fila = headers.map(header => {
            let valor = tarea[header] || '';
            // Escapar comillas y añadir comillas si hay comas
            if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"'))) {
                valor = '"' + valor.replace(/"/g, '""') + '"';
            }
            return valor;
        });
        csv += fila.join(',') + '\n';
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tareas_bargello.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.mostrarNotificacion('CSV exportado correctamente', 'success');
}

cargarCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const contenido = event.target.result;
            this.procesarCSV(contenido);
        };
        reader.readAsText(file);
    };
    
    input.click();
}

procesarCSV(contenido) {
    try {
        const filas = contenido.split('\n');
        const headers = filas[0].split(',');
        
        const tareas = [];
        
        for (let i = 1; i < filas.length; i++) {
            if (!filas[i].trim()) continue;
            
            const valores = this.parsearFilaCSV(filas[i]);
            const tarea = {};
            
            headers.forEach((header, index) => {
                if (header === 'id' || header === 'duracion_estimada' || header === 'progreso') {
                    tarea[header] = parseInt(valores[index]) || 0;
                } else {
                    tarea[header] = valores[index] || '';
                }
            });
            
            tareas.push(tarea);
        }
        
        this.datos.tareas = tareas;
        this.guardarDatos();
        this.renderizarTareas();
        this.actualizarDashboard();
        this.mostrarNotificacion('CSV importado correctamente', 'success');
    } catch (error) {
        console.error('Error al procesar CSV:', error);
        this.mostrarNotificacion('Error al procesar el archivo CSV', 'error');
    }
}

parsearFilaCSV(fila) {
    const valores = [];
    let enComillas = false;
    let valorActual = '';
    
    for (let i = 0; i < fila.length; i++) {
        const char = fila[i];
        
        if (char === '"') {
            if (enComillas && fila[i + 1] === '"') {
                // Doble comilla dentro de comillas
                valorActual += '"';
                i++;
            } else {
                // Inicio o fin de sección entrecomillada
                enComillas = !enComillas;
            }
        } else if (char === ',' && !enComillas) {
            // Fin de valor
            valores.push(valorActual);
            valorActual = '';
        } else {
            // Parte del valor actual
            valorActual += char;
        }
    }
    
    // Último valor
    valores.push(valorActual);
    
    return valores;
}

actualizarDashboard() {
    this.actualizarEstadoSalud();
    this.renderizarGraficos();
    this.actualizarTareasSugeridas();
}

actualizarEstadoSalud() {
    const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
    const hoy = new Date().toISOString().split('T')[0];
    
    const healthStatus = document.getElementById('healthStatus');
    const workCapacity = document.getElementById('workCapacity');
    
    if (ultimoRegistro && ultimoRegistro.fecha === hoy) {
        // Hay registro de hoy
        const capacidad = this.calcularCapacidadTrabajo(
            ultimoRegistro.dolor, 
            ultimoRegistro.fatiga, 
            ultimoRegistro.sueño
        );
        
        healthStatus.innerHTML = `
            <div class="status status--${ultimoRegistro.dolor > 6 ? 'error' : ultimoRegistro.dolor > 4 ? 'warning' : 'success'}">
                Dolor: ${ultimoRegistro.dolor}/10
            </div>
            <div class="status status--${ultimoRegistro.fatiga > 6 ? 'error' : ultimoRegistro.fatiga > 4 ? 'warning' : 'success'}">
                Fatiga: ${ultimoRegistro.fatiga}/10
            </div>
        `;
        
        workCapacity.innerHTML = `
            <h3>Capacidad de Trabajo: ${capacidad.toFixed(1)} horas</h3>
            <p>${this.obtenerRecomendacion(capacidad)}</p>
        `;
        
        // Iniciar sistema de descansos
        this.iniciarSistemaDescansos();
    } else {
        // No hay registro de hoy
        healthStatus.innerHTML = `
            <div class="status status--warning">
                No hay registro de hoy
            </div>
        `;
        
        workCapacity.innerHTML = `
            <h3>Capacidad de Trabajo: No disponible</h3>
            <p>Registra tu estado para calcular capacidad</p>
            <button id="healthRegisterBtn" class="btn btn--primary mt-8">Registrar ahora</button>
        `;
    }
}

obtenerRecomendacion(capacidad) {
    if (capacidad <= 3) {
        return 'Día de descanso - Solo tareas administrativas ligeras';
    } else if (capacidad <= 5) {
        return 'Capacidad moderada - Documentación y lectura';
    } else if (capacidad <= 6) {
        return 'Buen día - Trabajo moderado incluyendo bordado';
    } else {
        return 'Excelente capacidad - Día completo de trabajo';
    }
}

renderizarGraficos() {
    this.renderizarGraficoProgreso();
    this.renderizarGraficoSalud();
}

renderizarGraficoProgreso() {
    const ctx = document.getElementById('moduleProgressChart');
    
    // Agrupar tareas por módulo
    const modulos = {};
    this.datos.tareas.forEach(tarea => {
        if (!modulos[tarea.modulo]) {
            modulos[tarea.modulo] = {
                total: 0,
                completado: 0
            };
        }
        
        modulos[tarea.modulo].total++;
        modulos[tarea.modulo].completado += tarea.progreso / 100;
    });
    
    // Convertir a arrays para el gráfico
    const labels = Object.keys(modulos).sort();
    const data = labels.map(modulo => {
        const porcentaje = modulos[modulo].total > 0 
            ? (modulos[modulo].completado / modulos[modulo].total) * 100 
            : 0;
        return porcentaje.toFixed(1);
    });
    
    // Destruir gráfico anterior si existe
    if (this.progressChart) {
        this.progressChart.destroy();
    }
    
    // Crear nuevo gráfico
    this.progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(m => `Módulo ${m}`),
            datasets: [{
                label: 'Progreso (%)',
                data: data,
                backgroundColor: 'rgba(33, 128, 141, 0.7)',
                borderColor: 'rgba(33, 128, 141, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

configurarNotificaciones() {
    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    const contenedor = document.querySelector('.notifications') || document.createElement('div');
    
    if (!document.querySelector('.notifications')) {
        contenedor.className = 'notifications';
        document.body.appendChild(contenedor);
    }
    
    contenedor.appendChild(notificacion);
    
    // Mostrar notificación con animación
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

iniciarSistemaDescansos() {
    // Obtener último registro de salud
    const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
    
    if (ultimoRegistro) {
        const { dolor, fatiga } = ultimoRegistro;
        
        // Calcular intervalo de descanso basado en niveles de dolor y fatiga
        const intervaloMinutos = this.calcularIntervaloDescanso(dolor, fatiga);
        
        // Programar próxima notificación de descanso
        this.programarDescanso(intervaloMinutos);
    }
}

calcularIntervaloDescanso(dolor, fatiga) {
    // Base: 45 minutos entre descansos
    let intervaloBase = 45;
    
    // Ajustar según nivel de dolor (1-10)
    if (dolor >= 7) intervaloBase = 20;
    else if (dolor >= 5) intervaloBase = 30;
    else if (dolor >= 3) intervaloBase = 40;
    
    // Ajustar según fatiga (1-10)
    if (fatiga >= 7) intervaloBase -= 10;
    else if (fatiga >= 5) intervaloBase -= 5;
    
    // Garantizar mínimo 15 minutos entre descansos
    return Math.max(15, intervaloBase);
}

programarDescanso(minutos) {
    // Limpiar temporizador anterior si existe
    if (this.timerDescanso) {
        clearTimeout(this.timerDescanso);
    }
    
    // Programar próximo descanso
    this.timerDescanso = setTimeout(() => {
        this.mostrarNotificacionDescanso();
    }, minutos * 60 * 1000);
}

mostrarNotificacionDescanso() {
    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Tiempo de Descanso! 🌸', {
            body: 'Has trabajado suficiente. Toma un descanso para cuidar tu salud.',
            icon: '/icon-rest.png'
        });
    }
    
    // Crear y mostrar modal de descanso
    const modal = document.createElement('div');
    modal.className = 'modal-descanso';
    modal.innerHTML = `
        <div class="modal-contenido">
            <h3>¡Tiempo de Descanso! 🌸</h3>
            <p>Has trabajado suficiente. Toma un descanso para cuidar tu salud.</p>
            <button id="cerrarDescanso" class="btn btn--primary">Entendido</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar cierre del modal
    document.getElementById('cerrarDescanso').addEventListener('click', () => {
        modal.remove();
        
        // Programar próximo descanso
        const ultimoRegistro = this.datos.salud[this.datos.salud.length - 1];
        if (ultimoRegistro) {
            this.programarDescanso(this.calcularIntervaloDescanso(ultimoRegistro.dolor, ultimoRegistro.fatiga));
        }
    });
}

guardarDatos() {
    localStorage.setItem('bargelloDashboard', JSON.stringify(this.datos));
}

sincronizarDatos() {
    // Simular sincronización con servidor
    this.mostrarNotificacion('Sincronizando datos...', 'info');
    
    setTimeout(() => {
        // Guardar en localStorage como respaldo
        this.guardarDatos();
        
        // Actualizar timestamp de sincronización
        document.getElementById('lastSyncTime').textContent = new Date().toLocaleString();
        
        this.mostrarNotificacion('Datos sincronizados correctamente', 'success');
    }, 1500);
}

resetearDatos() {
    if (confirm('¿Estás segura de que quieres resetear todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('bargelloDashboard');
        this.mostrarNotificacion('Datos reseteados. Recargando...', 'warning');
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

poblarFiltroModulos() {
    const select = document.getElementById('filterModule');
    
    // Limpiar opciones existentes
    select.innerHTML = '';
    
    // Agregar opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Todos los módulos';
    select.appendChild(defaultOption);
    
    // Obtener módulos únicos
    const modulos = [...new Set(this.datos.tareas.map(t => t.modulo))].sort();
    
    // Agregar opciones de módulos
    modulos.forEach(modulo => {
        const option = document.createElement('option');
        option.value = modulo;
        option.textContent = `Módulo ${modulo}`;
        select.appendChild(option);
    });
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new BargelloDashboard();
});

// === Parte 3: Gestión avanzada de Markdown, tareas, redes sociales y utilidades ===

// --- Gestión avanzada de archivos Markdown ---

cargarArchivosMarkdown() {
    // Cargar todos los archivos .md de la carpeta md-files/
    if (!this.datos.archivos_md || this.datos.archivos_md.length === 0) {
        // Si no hay archivos en memoria, intentar cargar desde el servidor
        fetch('md-files/list.json')
            .then(res => res.json())
            .then(list => {
                // list debe ser un array de nombres de archivo .md
                Promise.all(list.map(nombre =>
                    fetch(`md-files/${nombre}`)
                        .then(res => res.text())
                        .then(contenido => ({
                            nombre,
                            titulo: nombre.replace(/-/g, ' ').replace('.md', ''),
                            contenido
                        }))
                )).then(mdArr => {
                    this.datos.archivos_md = mdArr;
                    this.guardarDatos();
                    this.actualizarListaArchivosMarkdown();
                });
            });
    } else {
        this.actualizarListaArchivosMarkdown();
    }
}

actualizarListaArchivosMarkdown() {
    const select = document.getElementById('mdFileSelect');
    select.innerHTML = '<option value="">Seleccionar archivo...</option>';
    this.datos.archivos_md.forEach(archivo => {
        const option = document.createElement('option');
        option.value = archivo.nombre;
        option.textContent = archivo.titulo || archivo.nombre;
        select.appendChild(option);
    });
}

cargarArchivoMarkdown(nombreArchivo) {
    if (!nombreArchivo) return;
    const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
    if (archivo) {
        document.getElementById('markdownEditor').value = archivo.contenido;
        document.getElementById('markdownPreview').innerHTML = marked.parse(archivo.contenido);
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
        document.getElementById('markdownPreview').innerHTML = marked.parse(contenido);
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

cambiarTabMarkdown(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('markdownEditor').style.display = tab === 'edit' ? 'block' : 'none';
    document.getElementById('markdownPreview').style.display = tab === 'preview' ? 'block' : 'none';
    if (tab === 'preview') {
        const contenido = document.getElementById('markdownEditor').value;
        document.getElementById('markdownPreview').innerHTML = marked.parse(contenido);
    }
}

// --- Gestión de redes sociales y sugerencias ---

renderizarCalendarioSocial() {
    const calendar = document.getElementById('socialCalendar');
    const suggestions = document.getElementById('contentSuggestions');
    const hoy = new Date();
    const inicioSemana = this.getInicioSemana(hoy);
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const contenidoProgramado = {
        1: ['Instagram: Foto de progreso'],
        3: ['YouTube: Tutorial semanal'],
        4: ['Instagram: Stories con tips']
    };
    calendar.innerHTML = diasSemana.map((dia, index) => {
        const fecha = new Date(inicioSemana);
        fecha.setDate(fecha.getDate() + index);
        const contenido = contenidoProgramado[index] || [];
        return `
            <div class="calendar-day">
                <div class="calendar-day-header">${dia} ${fecha.getDate()}/${fecha.getMonth() + 1}</div>
                ${contenido.map(post => `<div class="social-post">${post}</div>`).join('')}
            </div>
        `;
    }).join('');
    // Sugerencias de contenido según tareas actuales
    const tareasActuales = this.datos.tareas.filter(t => t.progreso > 0 && t.progreso < 100);
    if (tareasActuales.length > 0) {
        const sugerencias = {
            instagram: [
                `Time-lapse del bordado "${tareasActuales[0].nombre}"`,
                `Foto de detalle del patrón "${tareasActuales[0].nombre}"`,
                `Stories mostrando el proceso de selección de colores`
            ],
            youtube: [
                `Tutorial completo: Cómo bordar el patrón "${tareasActuales[0].nombre}"`,
                `Tips para resolver problemas comunes en el módulo ${tareasActuales[0].modulo}`,
                `Explicación de la historia detrás del patrón "${tareasActuales[0].nombre}"`
            ],
            pinterest: [
                `Infografía: Pasos para completar el patrón "${tareasActuales[0].nombre}"`,
                `Tablero de inspiración: Variaciones de color para el módulo ${tareasActuales[0].modulo}`,
                `Guía visual: Materiales necesarios para el patrón "${tareasActuales[0].nombre}"`
            ]
        };
        suggestions.innerHTML = `
            <div class="card"><div class="card__header"><h4>Instagram</h4></div>
                <div class="card__body"><ul>${sugerencias.instagram.map(s => `<li>${s}</li>`).join('')}</ul></div>
            </div>
            <div class="card"><div class="card__header"><h4>YouTube</h4></div>
                <div class="card__body"><ul>${sugerencias.youtube.map(s => `<li>${s}</li>`).join('')}</ul></div>
            </div>
            <div class="card"><div class="card__header"><h4>Pinterest</h4></div>
                <div class="card__body"><ul>${sugerencias.pinterest.map(s => `<li>${s}</li>`).join('')}</ul></div>
            </div>
        `;
    } else {
        suggestions.innerHTML = `<div class="card"><div class="card__body"><p>No hay tareas en progreso para generar sugerencias personalizadas.</p></div></div>`;
    }
}

// --- Utilidades extra y helpers ---

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

// --- Inicialización final ---

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new BargelloDashboard();
});


