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
    this.iniciarSistemaDescansos();
  }

  cargarDatosIniciales() {
    // Cargar datos desde localStorage o usar datos por defecto
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
            contenido: "# Módulo 0 - Punto 1: Video de Bienvenida\n\n## Objetivos\n- Presentar la filosofía del taller\n- Explicar la historia del Bargello\n- Establecer expectativas del curso\n\n## Contenido del Video\n1. Presentación personal\n2. Historia del bordado Bargello\n3. Beneficios terapéuticos\n4. Estructura del curso\n\n## Notas de Producción\n- Duración: 15-20 minutos\n- Formato: HD 1080p\n- Incluir subtítulos"
          },
          // Más archivos markdown...
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
          },
          pinterest: {
            cuenta: "TinicraftsBargello",
            frecuencia: "1 vez por semana",
            horarios: ["Jueves 10:00"],
            contenido_sugerido: ["Infografías técnicas", "Paletas de colores", "Patrones gratuitos"]
          },
          facebook: {
            pagina: "Tinicrafts Bargello",
            frecuencia: "3 veces por semana",
            horarios: ["Lunes 12:00", "Miércoles 17:00", "Viernes 19:00"],
            contenido_sugerido: ["Actualizaciones de proyectos", "Testimonios de alumnas", "Eventos y sesiones en vivo"]
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
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
          if (modal.id === 'taskModal') {
            this.editingTaskId = null;
          }
        }
      });
    });

    // Botones de cierre de modales
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
          if (modal.id === 'taskModal') {
            this.editingTaskId = null;
          }
        }
      });
    });

    // Tecla ESC para cerrar modales
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
          modal.classList.remove('show');
          if (modal.id === 'taskModal') {
            this.editingTaskId = null;
          }
        });
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

  // Gestión de Salud
  registrarSalud() {
    const dolor = parseInt(document.getElementById('dolorSlider').value);
    const fatiga = parseInt(document.getElementById('fatigaSlider').value);
    const sueño = parseInt(document.getElementById('suenoSlider').value);
    const hoy = new Date().toISOString().split('T')[0];
    
    // Buscar si ya existe registro de hoy
    const indiceExistente = this.datos.salud.findIndex(registro => registro.fecha === hoy);
    const nuevoRegistro = {
      fecha: hoy,
      dolor,
      fatiga,
      sueño,
      horas_trabajadas: 0 // Se actualizará durante el día
    };
    
    if (indiceExistente !== -1) {
      this.datos.salud[indiceExistente] = nuevoRegistro;
    } else {
      this.datos.salud.push(nuevoRegistro);
    }
    
    // Mantener solo últimos 30 días
    this.datos.salud = this.datos.salud.slice(-30);
    
    this.guardarDatos();
    this.actualizarEstadoSalud();
    this.renderizarGraficoSalud();
    this.mostrarNotificacion('Registro de salud guardado', 'success');
    
    // Calcular y mostrar recomendaciones
    this.calcularRecomendaciones(dolor, fatiga, sueño);
    
    // Reiniciar sistema de descansos con nuevos valores
    this.iniciarSistemaDescansos(dolor, fatiga, sueño);
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
      tareasSugeridas = this.datos.tareas
        .filter(t => t.duracion_estimada <= 2 && t.estado !== 'completado')
        .slice(0, 2);
    } else if (capacidad <= 5) {
      recomendacion = 'Capacidad moderada - Documentación y lectura';
      tareasSugeridas = this.datos.tareas
        .filter(t => t.duracion_estimada <= 4 && t.estado !== 'completado')
        .slice(0, 3);
    } else if (capacidad <= 6) {
      recomendacion = 'Buen día - Trabajo moderado incluyendo bordado';
      tareasSugeridas = this.datos.tareas
        .filter(t => t.duracion_estimada <= 8 && t.estado !== 'completado')
        .slice(0, 4);
    } else {
      recomendacion = 'Excelente capacidad - Día completo de trabajo';
      tareasSugeridas = this.datos.tareas
        .filter(t => t.estado !== 'completado')
        .slice(0, 5);
    }
    
    // Actualizar UI
    const capacidadElement = document.getElementById('workCapacity');
    if (capacidadElement) {
      capacidadElement.innerHTML = `
        <div class="card">
          <div class="card__header">
            <h4>Capacidad de Trabajo Estimada</h4>
          </div>
          <div class="card__body">
            <p><strong>${capacidad.toFixed(1)} horas</strong> - ${recomendacion}</p>
            <h5>Tareas Recomendadas:</h5>
            <ul>
              ${tareasSugeridas.map(t => `<li>${t.nombre} (${t.duracion_estimada}h)</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }
  }

  actualizarEstadoSalud() {
    const hoy = new Date().toISOString().split('T')[0];
    const registroHoy = this.datos.salud.find(r => r.fecha === hoy);
    
    const estadoSaludElement = document.getElementById('healthStatus');
    if (estadoSaludElement) {
      if (registroHoy) {
        estadoSaludElement.innerHTML = `
          <span class="health-status">
            <i class="fas fa-heartbeat"></i> Dolor: ${registroHoy.dolor}/10
          </span>
          <span class="health-status">
            <i class="fas fa-battery-half"></i> Fatiga: ${registroHoy.fatiga}/10
          </span>
          <span class="health-status">
            <i class="fas fa-moon"></i> Sueño: ${registroHoy.sueño}/10
          </span>
        `;
        
        // Calcular recomendaciones
        this.calcularRecomendaciones(registroHoy.dolor, registroHoy.fatiga, registroHoy.sueño);
      } else {
        estadoSaludElement.innerHTML = `
          <span class="health-status">
            <i class="fas fa-exclamation-circle"></i> No hay registro de salud para hoy
          </span>
          <button id="healthRegisterBtn" class="btn btn--primary btn--sm">Registrar ahora</button>
        `;
        
        // Reiniciar listener del botón
        document.getElementById('healthRegisterBtn').addEventListener('click', () => {
          this.cambiarVista('salud');
        });
      }
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
    this.renderizarHistorialSalud();
  }

  renderizarGraficoSalud() {
    const ctx = document.getElementById('healthChart');
    if (!ctx) return;
    
    // Obtener datos de los últimos 7 días
    const ultimos7Dias = this.datos.salud.slice(-7);
    const fechas = ultimos7Dias.map(r => r.fecha.split('-').slice(1).join('/'));
    const dolores = ultimos7Dias.map(r => r.dolor);
    const fatigas = ultimos7Dias.map(r => r.fatiga);
    const suenos = ultimos7Dias.map(r => r.sueño);
    
    // Limpiar canvas si ya existe un gráfico
    if (ctx._chart) {
      ctx._chart.destroy();
    }
    
    // Crear nuevo gráfico
    ctx._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [
          {
            label: 'Dolor',
            data: dolores,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.3
          },
          {
            label: 'Fatiga',
            data: fatigas,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.3
          },
          {
            label: 'Sueño',
            data: suenos,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 1
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  renderizarHistorialSalud() {
    const historialContainer = document.getElementById('healthHistory');
    if (!historialContainer) return;
    
    // Ordenar por fecha descendente
    const historialOrdenado = [...this.datos.salud].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    
    historialContainer.innerHTML = `
      <div class="card">
        <div class="card__header">
          <h4>Historial de Salud (Últimos 30 días)</h4>
        </div>
        <div class="card__body">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Dolor</th>
                <th>Fatiga</th>
                <th>Sueño</th>
                <th>Horas Trabajadas</th>
              </tr>
            </thead>
            <tbody>
              ${historialOrdenado.map(r => `
                <tr>
                  <td>${this.formatearFecha(r.fecha)}</td>
                  <td>${this.renderizarBarraValor(r.dolor, 10)}</td>
                  <td>${this.renderizarBarraValor(r.fatiga, 10)}</td>
                  <td>${this.renderizarBarraValor(r.sueño, 10)}</td>
                  <td>${r.horas_trabajadas}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderizarBarraValor(valor, maximo) {
    const porcentaje = (valor / maximo) * 100;
    let color = 'var(--color-success)';
    
    if (valor > 7) {
      color = 'var(--color-error)';
    } else if (valor > 5) {
      color = 'var(--color-warning)';
    }
    
    return `
      <div class="progress-bar" title="${valor}/${maximo}">
        <div class="progress-bar__fill" style="width: ${porcentaje}%; background-color: ${color}"></div>
        <span class="progress-bar__text">${valor}</span>
      </div>
    `;
  }

  formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  // Sistema de descansos para fibromialgia
  iniciarSistemaDescansos(dolor, fatiga, sueño) {
    // Limpiar temporizadores anteriores
    if (this.descansoTimer) {
      clearTimeout(this.descansoTimer);
    }
    
    // Si no hay valores, usar los del último registro
    if (!dolor || !fatiga || !sueño) {
      const hoy = new Date().toISOString().split('T')[0];
      const registroHoy = this.datos.salud.find(r => r.fecha === hoy);
      
      if (registroHoy) {
        dolor = registroHoy.dolor;
        fatiga = registroHoy.fatiga;
        sueño = registroHoy.sueño;
      } else {
        // Valores por defecto si no hay registro
        dolor = 5;
        fatiga = 6;
        sueño = 6;
      }
    }
    
    // Calcular intervalo de descanso basado en estado de salud
    const intervaloMinutos = this.calcularIntervaloDescanso(dolor, fatiga, sueño);
    
    // Programar próximo descanso
    this.programarDescanso(intervaloMinutos);
  }

  calcularIntervaloDescanso(dolor, fatiga, sueño) {
    let intervaloBase = 45; // minutos
    
    // Ajustar según nivel de dolor (1-10)
    if (dolor >= 7) intervaloBase = 20;
    else if (dolor >= 5) intervaloBase = 30;
    else if (dolor >= 3) intervaloBase = 40;
    
    // Ajustar según fatiga (1-10)
    if (fatiga >= 7) intervaloBase -= 10;
    else if (fatiga >= 5) intervaloBase -= 5;
    
    // Ajustar según calidad de sueño (1-10, donde 10 es excelente)
    if (sueño <= 4) intervaloBase -= 5;
    
    // Garantizar un mínimo de 15 minutos
    return Math.max(15, intervaloBase);
  }

  programarDescanso(minutos) {
    console.log(`Programando descanso en ${minutos} minutos`);
    
    this.descansoTimer = setTimeout(() => {
      this.mostrarNotificacionDescanso();
    }, minutos * 60 * 1000);
  }

  mostrarNotificacionDescanso() {
    // Determinar duración del descanso basado en estado de salud
    const hoy = new Date().toISOString().split('T')[0];
    const registroHoy = this.datos.salud.find(r => r.fecha === hoy);
    const nivelDolor = registroHoy ? registroHoy.dolor : 5;
    
    const duracionDescanso = nivelDolor >= 6 ? 15 : 10;
    
    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('¡Tiempo de Descanso! 🌸', {
        body: `Has trabajado suficiente. Toma un descanso de ${duracionDescanso} minutos para cuidar tu salud.`,
        icon: '/icon-rest.png'
      });
    }
    
    // Mostrar modal en la aplicación
    this.mostrarModalDescanso(duracionDescanso);
    
    // Programar próximo descanso después de este
    const intervaloMinutos = this.calcularIntervaloDescanso(
      registroHoy ? registroHoy.dolor : 5,
      registroHoy ? registroHoy.fatiga : 6,
      registroHoy ? registroHoy.sueño : 6
    );
    
    // Programar próximo descanso después de este
    setTimeout(() => {
      this.programarDescanso(intervaloMinutos);
    }, duracionDescanso * 60 * 1000);
  }

  mostrarModalDescanso(duracion) {
    // Crear modal de descanso
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'breakModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>¡Tiempo de Descanso! 🌸</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Cuida tu salud tomando un descanso de ${duracion} minutos</p>
          <div class="break-timer" id="break-timer">${duracion}:00</div>
          <div class="break-suggestions">
            <h4>Sugerencias para tu descanso:</h4>
            <ul>
              <li>Estira suavemente tus manos y muñecas</li>
              <li>Realiza respiraciones profundas</li>
              <li>Toma un poco de agua</li>
              <li>Mira a lo lejos para descansar la vista</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--primary modal-close-btn">Entendido</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar temporizador visual
    let tiempoRestante = duracion * 60;
    const timerElement = document.getElementById('break-timer');
    
    const timerInterval = setInterval(() => {
      tiempoRestante--;
      
      const minutos = Math.floor(tiempoRestante / 60);
      const segundos = tiempoRestante % 60;
      
      timerElement.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
      
      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
        }, 300);
      }
    }, 1000);
    
    // Configurar cierre del modal
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
      clearInterval(timerInterval);
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    });
    
    // Cerrar con clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        clearInterval(timerInterval);
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
        }, 300);
      }
    });
    
    // Cerrar con ESC
    const escListener = (e) => {
      if (e.key === 'Escape') {
        clearInterval(timerInterval);
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
          document.removeEventListener('keydown', escListener);
        }, 300);
      }
    };
    
    document.addEventListener('keydown', escListener);
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
    
    // Cargar archivo MD asociado si existe
    if (tarea.archivo_md) {
      document.getElementById('taskMdFile').value = tarea.archivo_md;
    }
  }

  limpiarFormularioTarea() {
    document.getElementById('taskForm').reset();
    document.getElementById('taskProgressValue').textContent = '0%';
    document.getElementById('taskResponsible').value = 'Tini Sanhueza';
    
    // Establecer fechas por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('taskStartDate').value = hoy;
    
    const unaSemana = new Date();
    unaSemana.setDate(unaSemana.getDate() + 7);
    document.getElementById('taskEndDate').value = unaSemana.toISOString().split('T')[0];
  }

  guardarTarea() {
    const tarea = {
      nombre: document.getElementById('taskName').value,
      descripcion: document.getElementById('taskDescription').value,
      modulo: document.getElementById('taskModule').value,
      seccion: document.getElementById('taskSection').value,
      fecha_inicio: document.getElementById('taskStartDate').value,
      fecha_limite: document.getElementById('taskEndDate').value,
      duracion_estimada: parseInt(document.getElementById('taskDuration').value) || 1,
      dependencias: document.getElementById('taskDependencies')?.value || '',
      prioridad: document.getElementById('taskPriority').value,
      progreso: parseInt(document.getElementById('taskProgress').value),
      estado: document.getElementById('taskStatus').value,
      responsable: document.getElementById('taskResponsible').value,
      notas: document.getElementById('taskNotes').value,
      archivo_md: document.getElementById('taskMdFile')?.value || ''
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
    this.renderizarTimeline();
  }

  eliminarTarea(taskId) {
    if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
      this.datos.tareas = this.datos.tareas.filter(t => t.id !== taskId);
      this.guardarDatos();
      this.renderizarTareas();
      this.mostrarNotificacion('Tarea eliminada', 'success');
      this.actualizarDashboard();
      this.renderizarTimeline();
    }
  }

  renderizarTareas() {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;
    
    const tareasFiltradas = this.filtrarTareasArray();
    
    tbody.innerHTML = tareasFiltradas.map(tarea => `
      <tr>
        <td>${tarea.nombre}</td>
        <td>Módulo ${tarea.modulo}</td>
        <td>
          <span class="status status--${this.getEstadoClass(tarea.estado)}">
            ${tarea.estado}
          </span>
        </td>
        <td>
          <div class="task-progress">
            <div class="progress-bar">
              <div class="progress-bar__fill" style="width: ${tarea.progreso}%"></div>
              <span class="progress-bar__text">${tarea.progreso}%</span>
            </div>
          </div>
        </td>
        <td>${this.formatearFecha(tarea.fecha_limite)}</td>
        <td><span class="priority-${tarea.prioridad}">${tarea.prioridad}</span></td>
        <td>
          <div class="task-actions">
            <button onclick="dashboard.abrirModalTarea(${tarea.id})" class="btn btn--secondary btn--sm">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="dashboard.eliminarTarea(${tarea.id})" class="btn btn--secondary btn--sm">
              <i class="fas fa-trash"></i>
            </button>
            ${tarea.archivo_md ? `
              <button onclick="dashboard.abrirArchivoMd('${tarea.archivo_md}')" class="btn btn--secondary btn--sm">
                <i class="fas fa-file-alt"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  getEstadoClass(estado) {
    switch (estado) {
      case 'completado':
        return 'success';
      case 'en progreso':
        return 'info';
      case 'pendiente':
        return 'warning';
      case 'retrasado':
        return 'error';
      default:
        return 'info';
    }
  }

  poblarFiltroModulos() {
    const select = document.getElementById('filterModule');
    if (!select) return;
    
    // Obtener módulos únicos
    const modulos = [...new Set(this.datos.tareas.map(t => t.modulo))].sort((a, b) => a - b);
    
    // Agregar opciones
    select.innerHTML = `
      <option value="">Todos los módulos</option>
      ${modulos.map(m => `<option value="${m}">Módulo ${m}</option>`).join('')}
    `;
  }

  filtrarTareas() {
    this.renderizarTareas();
  }

  filtrarTareasArray() {
    const busqueda = document.getElementById('searchTasks')?.value.toLowerCase() || '';
    const moduloFiltro = document.getElementById('filterModule')?.value || '';
    const estadoFiltro = document.getElementById('filterStatus')?.value || '';
    
    return this.datos.tareas.filter(tarea => {
      // Filtro de búsqueda
      const coincideBusqueda = busqueda === '' || 
        tarea.nombre.toLowerCase().includes(busqueda) || 
        tarea.descripcion.toLowerCase().includes(busqueda);
      
      // Filtro de módulo
      const coincideModulo = moduloFiltro === '' || tarea.modulo === moduloFiltro;
      
      // Filtro de estado
      const coincideEstado = estadoFiltro === '' || tarea.estado === estadoFiltro;
      
      return coincideBusqueda && coincideModulo && coincideEstado;
    });
  }

  // Timeline y Cronograma
  renderizarTimeline() {
    const timelineGrid = document.getElementById('timelineGrid');
    if (!timelineGrid) return;
    
    // Obtener fechas de la semana actual
    const fechasSemana = this.obtenerFechasSemana(this.currentWeek);
    
    // Actualizar encabezado de semana
    document.getElementById('currentWeekLabel').textContent = 
      `${this.formatearFecha(fechasSemana[0])} - ${this.formatearFecha(fechasSemana[6])}`;
    
    // Generar grid de días
    timelineGrid.innerHTML = fechasSemana.map((fecha, index) => {
      const tareasDia = this.obtenerTareasPorFecha(fecha);
      const esHoy = fecha === new Date().toISOString().split('T')[0];
      const diaSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][new Date(fecha).getDay()];
      
      return `
        <div class="timeline-day ${esHoy ? 'timeline-day--today' : ''}">
          <h4>${diaSemana} ${new Date(fecha).getDate()}</h4>
          <div class="timeline-tasks">
            ${tareasDia.map(tarea => `
              <div class="timeline-task" 
                   onclick="dashboard.abrirModalTarea(${tarea.id})"
                   style="background-color: var(--color-${this.getColorByPriority(tarea.prioridad)})">
                ${tarea.nombre}
              </div>
            `).join('')}
            ${tareasDia.length === 0 ? '<div class="timeline-empty">Sin tareas</div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  obtenerFechasSemana(fecha) {
    const fechas = [];
    const primerDia = new Date(fecha);
    
    // Ajustar al lunes de la semana
    const diaSemana = primerDia.getDay();
    primerDia.setDate(primerDia.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    
    // Generar 7 días
    for (let i = 0; i < 7; i++) {
      const nuevaFecha = new Date(primerDia);
      nuevaFecha.setDate(primerDia.getDate() + i);
      fechas.push(nuevaFecha.toISOString().split('T')[0]);
    }
    
    return fechas;
  }

  obtenerTareasPorFecha(fecha) {
    return this.datos.tareas.filter(tarea => {
      const fechaInicio = new Date(tarea.fecha_inicio);
      const fechaLimite = new Date(tarea.fecha_limite);
      const fechaActual = new Date(fecha);
      
      // Ajustar a medianoche para comparación correcta
      fechaInicio.setHours(0, 0, 0, 0);
      fechaLimite.setHours(23, 59, 59, 999);
      fechaActual.setHours(12, 0, 0, 0);
      
      return fechaActual >= fechaInicio && fechaActual <= fechaLimite;
    });
  }

  getColorByPriority(prioridad) {
    switch (prioridad) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baja':
        return 'success';
      default:
        return 'info';
    }
  }

  cambiarSemana(direccion) {
    const nuevaFecha = new Date(this.currentWeek);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
    this.currentWeek = nuevaFecha;
    this.renderizarTimeline();
  }

  // Markdown Editor
  cargarArchivosMarkdown() {
    const select = document.getElementById('mdFileSelect');
    if (!select) return;
    
    // Limpiar opciones actuales
    select.innerHTML = '<option value="">Seleccionar archivo</option>';
    
    // Agregar opciones de archivos
    this.datos.archivos_md.forEach(archivo => {
      select.innerHTML += `<option value="${archivo.nombre}">${archivo.titulo || archivo.nombre}</option>`;
    });
  }

  cargarArchivoMarkdown(nombreArchivo) {
    const archivo = this.datos.archivos_md.find(a => a.nombre === nombreArchivo);
    if (!archivo) return;
    
    document.getElementById('markdownEditor').value = archivo.contenido;
    this.renderizarPreviewMarkdown(archivo.contenido);
    this.cambiarTabMarkdown('edit');
  }

  cambiarTabMarkdown(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    
    document.getElementById('markdownEditor').style.display = tab === 'edit' ? 'block' : 'none';
    document.getElementById('markdownPreview').style.display = tab === 'preview' ? 'block' : 'none';
    
    if (tab === 'preview') {
      const contenido = document.getElementById('markdownEditor').value;
      this.renderizarPreviewMarkdown(contenido);
    }
  }

  renderizarPreviewMarkdown(contenido) {
    const previewElement = document.getElementById('markdownPreview');
    if (!previewElement) return;
    
    // Usar marked.js para convertir Markdown a HTML
    if (window.marked) {
      previewElement.innerHTML = marked.parse(contenido);
    } else {
      // Fallback simple si marked.js no está disponible
      previewElement.innerHTML = `<pre>${contenido}</pre>`;
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
    if (!nombre) return;
    
    const nombreCompleto = `${nombre}.md`;
    
    // Verificar si ya existe
    if (this.datos.archivos_md.some(a => a.nombre === nombreCompleto)) {
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
    this.cargarArchivosMarkdown();
    
    // Seleccionar el nuevo archivo
    document.getElementById('mdFileSelect').value = nombreCompleto;
    this.cargarArchivoMarkdown(nombreCompleto);
    
    this.mostrarNotificacion('Archivo creado', 'success');
  }

  abrirArchivoMd(nombreArchivo) {
    this.cambiarVista('markdown');
    document.getElementById('mdFileSelect').value = nombreArchivo;
    this.cargarArchivoMarkdown(nombreArchivo);
  }

  // Redes Sociales
  renderizarCalendarioSocial() {
    const calendar = document.getElementById('socialCalendar');
    const suggestions = document.getElementById('contentSuggestions');
    if (!calendar || !suggestions) return;
    
    // Generar calendario simple para la semana actual
    const hoy = new Date();
    const inicioSemana = this.getInicioSemana(hoy);
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    // Contenido programado basado en configuración de redes sociales
    const contenidoProgramado = this.generarContenidoProgramado();
    
    calendar.innerHTML = diasSemana.map((dia, index) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(fecha.getDate() + index);
      const fechaStr = fecha.toISOString().split('T')[0];
      const contenido = contenidoProgramado[index] || [];
      const esHoy = fechaStr === new Date().toISOString().split('T')[0];
      
      return `
        <div class="calendar-day ${esHoy ? 'calendar-day--today' : ''}">
          <div class="calendar-day-header">${dia} ${fecha.getDate()}</div>
          <div class="calendar-day-content">
            ${contenido.map(item => `
              <div class="social-post" style="background-color: ${this.getColorByPlatform(item.split(':')[0])}">
                ${item}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    // Generar sugerencias de contenido basadas en tareas actuales
    this.renderizarSugerenciasContenido();
  }

  getInicioSemana(fecha) {
    const primerDia = new Date(fecha);
    const diaSemana = primerDia.getDay();
    primerDia.setDate(primerDia.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    return primerDia;
  }

  generarContenidoProgramado() {
    const programacion = {};
    
    // Instagram: Lunes y Jueves
    if (this.datos.redes_sociales.instagram) {
      programacion[0] = programacion[0] || [];
      programacion[3] = programacion[3] || [];
      programacion[0].push('Instagram: Foto de progreso');
      programacion[3].push('Instagram: Stories con tips');
    }
    
    // YouTube: Miércoles
    if (this.datos.redes_sociales.youtube) {
      programacion[2] = programacion[2] || [];
      programacion[2].push('YouTube: Tutorial semanal');
    }
    
    // Pinterest: Jueves
    if (this.datos.redes_sociales.pinterest) {
      programacion[3] = programacion[3] || [];
      programacion[3].push('Pinterest: Infografía técnica');
    }
    
    // Facebook: Lunes, Miércoles, Viernes
    if (this.datos.redes_sociales.facebook) {
      programacion[0] = programacion[0] || [];
      programacion[2] = programacion[2] || [];
      programacion[4] = programacion[4] || [];
      programacion[0].push('Facebook: Actualización de proyecto');
      programacion[2].push('Facebook: Testimonio de alumna');
      programacion[4].push('Facebook: Anuncio de sesión en vivo');
    }
    
    return programacion;
  }

  getColorByPlatform(platform) {
    const colors = {
      'Instagram': '#E1306C',
      'YouTube': '#FF0000',
      'Pinterest': '#E60023',
      'Facebook': '#1877F2',
      'TikTok': '#000000'
    };
    
    return colors[platform] || 'var(--color-primary)';
  }

  renderizarSugerenciasContenido() {
    const suggestions = document.getElementById('contentSuggestions');
    if (!suggestions) return;
    
    // Obtener tareas actuales para generar sugerencias contextuales
    const tareasActuales = this.datos.tareas
      .filter(t => t.progreso > 0 && t.progreso < 100)
      .slice(0, 3);
    
    const sugerencias = {
      instagram: [
        'Time-lapse del proceso de bordado del patrón actual',
        'Foto de detalle mostrando la técnica de compensación',
        'Stories con preguntas sobre preferencias de color',
        'Reel comparando antes/después del proyecto mensual'
      ],
      youtube: [
        'Tutorial completo del patrón base actual',
        'Video explicativo sobre teoría del color en Bargello',
        'Resolución de dudas frecuentes sobre tensión del hilo',
        'Demostración de técnicas de acabado profesional'
      ],
      pinterest: [
        'Infografía sobre los 5 errores más comunes en Bargello',
        'Tablero de inspiración con combinaciones de colores',
        'Guía visual paso a paso del proyecto mensual',
        'Plantilla descargable para planificar patrones'
      ],
      facebook: [
        'Publicación detallada sobre la historia del Bargello',
        'Encuesta sobre próximos temas para el taller',
        'Anuncio de la próxima sesión en vivo con agenda',
        'Testimonio de alumna destacada con su proyecto'
      ]
    };
    
    // Personalizar sugerencias basadas en tareas actuales
    if (tareasActuales.length > 0) {
      const tarea = tareasActuales[0];
      sugerencias.instagram.unshift(`Foto de progreso del proyecto "${tarea.nombre}"`);
      sugerencias.youtube.unshift(`Tutorial sobre la técnica principal de "${tarea.nombre}"`);
      sugerencias.pinterest.unshift(`Infografía sobre el patrón utilizado en "${tarea.nombre}"`);
      sugerencias.facebook.unshift(`Publicación explicando el proceso de "${tarea.nombre}"`);
    }
    
    // Renderizar sugerencias
    suggestions.innerHTML = `
      <div class="social-suggestions">
        <div class="card">
          <div class="card__header">
            <h4><i class="fab fa-instagram"></i> Instagram</h4>
          </div>
          <div class="card__body">
            <ul>
              ${sugerencias.instagram.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="card">
          <div class="card__header">
            <h4><i class="fab fa-youtube"></i> YouTube</h4>
          </div>
          <div class="card__body">
            <ul>
              ${sugerencias.youtube.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="card">
          <div class="card__header">
            <h4><i class="fab fa-pinterest"></i> Pinterest</h4>
          </div>
          <div class="card__body">
            <ul>
              ${sugerencias.pinterest.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="card">
          <div class="card__header">
            <h4><i class="fab fa-facebook"></i> Facebook</h4>
          </div>
          <div class="card__body">
            <ul>
              ${sugerencias.facebook.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Dashboard
  actualizarDashboard() {
    this.actualizarEstadoSalud();
    this.renderizarProgresoModulos();
    this.renderizarTareasPendientes();
  }

  renderizarProgresoModulos() {
    const container = document.getElementById('moduleProgress');
    if (!container) return;
    
    // Agrupar tareas por módulo
    const modulos = {};
    this.datos.tareas.forEach(tarea => {
      if (!modulos[tarea.modulo]) {
        modulos[tarea.modulo] = {
          total: 0,
          completado: 0,
          tareas: []
        };
      }
      
      modulos[tarea.modulo].total++;
      modulos[tarea.modulo].tareas.push(tarea);
      
      if (tarea.estado === 'completado') {
        modulos[tarea.modulo].completado++;
      }
    });
    
    // Ordenar módulos
    const modulosOrdenados = Object.keys(modulos).sort((a, b) => a - b);
    
    // Renderizar progreso
    container.innerHTML = `
      <div class="card">
        <div class="card__header">
          <h4>Progreso de Módulos</h4>
        </div>
        <div class="card__body">
          ${modulosOrdenados.map(modulo => {
            const progreso = modulos[modulo].total > 0 
              ? Math.round((modulos[modulo].completado / modulos[modulo].total) * 100) 
              : 0;
            
            return `
              <div class="module-progress">
                <div class="module-progress__header">
                  <h5>Módulo ${modulo}</h5>
                  <span>${progreso}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar__fill" style="width: ${progreso}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderizarTareasPendientes() {
    const container = document.getElementById('pendingTasks');
    if (!container) return;
    
    // Obtener tareas pendientes ordenadas por fecha límite
    const tareasPendientes = this.datos.tareas
      .filter(t => t.estado !== 'completado')
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
      .slice(0, 5);
    
    container.innerHTML = `
      <div class="card">
        <div class="card__header">
          <h4>Tareas Pendientes</h4>
        </div>
        <div class="card__body">
          ${tareasPendientes.length > 0 ? `
            <ul class="pending-tasks-list">
              ${tareasPendientes.map(tarea => `
                <li class="pending-task">
                  <div class="pending-task__header">
                    <h5>${tarea.nombre}</h5>
                    <span class="priority-${tarea.prioridad}">${tarea.prioridad}</span>
                  </div>
                  <div class="pending-task__details">
                    <span>Módulo ${tarea.modulo}</span>
                    <span>Límite: ${this.formatearFecha(tarea.fecha_limite)}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${tarea.progreso}%"></div>
                    <span class="progress-bar__text">${tarea.progreso}%</span>
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : '<p>No hay tareas pendientes</p>'}
        </div>
      </div>
    `;
  }

  renderizarGraficos() {
    this.renderizarGraficoSalud();
    this.renderizarGraficoTareas();
  }

  renderizarGraficoTareas() {
    const ctx = document.getElementById('tasksChart');
    if (!ctx) return;
    
    // Contar tareas por estado
    const estados = {
      'completado': 0,
      'en progreso': 0,
      'pendiente': 0,
      'retrasado': 0
    };
    
    this.datos.tareas.forEach(tarea => {
      estados[tarea.estado] = (estados[tarea.estado] || 0) + 1;
    });
    
    // Limpiar canvas si ya existe un gráfico
    if (ctx._chart) {
      ctx._chart.destroy();
    }
    
    // Crear nuevo gráfico
    ctx._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(estados).map(e => e.charAt(0).toUpperCase() + e.slice(1)),
        datasets: [{
