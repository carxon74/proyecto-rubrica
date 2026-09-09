(function(){
  var state = { verificado:false, correo:'', codigo:'', programaCodigo:'', programaNombre:'', semestre:'' };
  var submissions = [];
  var folioSeq = 1;

  var programNames = {
    AMB:'Ingeniería Ambiental', CIV:'Ingeniería Civil', ELE:'Ingeniería Eléctrica',
    ELN:'Ingeniería Electrónica', IND:'Ingeniería Industrial', MEC:'Ingeniería Mecánica', SIS:'Ingeniería de Sistemas'
  };

  var formVerificacion = document.getElementById('formVerificacion');
  var formSugerencia = document.getElementById('formSugerencia');
  var confirmacion = document.getElementById('confirmacion');
  var errorVerificacion = document.getElementById('errorVerificacion');
  var errorSugerencia = document.getElementById('errorSugerencia');

  function showError(box, msg){ box.textContent = msg; box.classList.add('show'); }
  function hideError(box){ box.classList.remove('show'); box.textContent=''; }

  formVerificacion.addEventListener('submit', function(e){
    e.preventDefault();
    hideError(errorVerificacion);
    var correo = document.getElementById('correo').value.trim();
    var codigo = document.getElementById('codigo').value.trim();
    var programa = document.getElementById('programa').value;
    var semestre = document.getElementById('semestre').value;
    var declara = document.getElementById('declaracion').checked;

    var correoOk = /^[a-zA-Z0-9._%+-]+@cuc\.edu\.co$/i.test(correo);
    var codigoOk = /^[0-9]{6,12}$/.test(codigo);

    if(!correoOk){ showError(errorVerificacion, 'Este buzón es exclusivo para el correo institucional @cuc.edu.co.'); return; }
    if(!codigoOk){ showError(errorVerificacion, 'Ingresa un código estudiantil válido (solo números).'); return; }
    if(!programa){ showError(errorVerificacion, 'Selecciona tu programa académico.'); return; }
    if(!semestre){ showError(errorVerificacion, 'Selecciona tu semestre.'); return; }
    if(!declara){ showError(errorVerificacion, 'Debes confirmar que eres estudiante activo de Ingeniería para continuar.'); return; }

    state.verificado = true;
    state.correo = correo;
    state.codigo = codigo;
    state.programaCodigo = programa;
    state.programaNombre = programNames[programa];
    state.semestre = semestre;

    document.getElementById('programaVerificado').textContent = state.programaNombre;
    formVerificacion.style.display = 'none';
    formSugerencia.style.display = 'block';
    formSugerencia.querySelector('#categoria').focus();
  });

  document.getElementById('cambiarVerificacion').addEventListener('click', function(){
    formSugerencia.style.display = 'none';
    formVerificacion.style.display = 'block';
    formVerificacion.reset();
    hideError(errorVerificacion);
  });

  document.getElementById('anonimo').addEventListener('change', function(){
    var nombre = document.getElementById('nombre');
    nombre.disabled = this.checked;
    if(this.checked) nombre.value = '';
  });

  formSugerencia.addEventListener('submit', function(e){
    e.preventDefault();
    hideError(errorSugerencia);
    var anonimo = document.getElementById('anonimo').checked;
    var nombre = document.getElementById('nombre').value.trim();
    var categoria = document.getElementById('categoria').value;
    var prioridadEl = formSugerencia.querySelector('input[name=prioridad]:checked');
    var mensaje = document.getElementById('mensaje').value.trim();

    if(!categoria){ showError(errorSugerencia, 'Selecciona una categoría para tu sugerencia.'); return; }
    if(!prioridadEl){ showError(errorSugerencia, 'Selecciona una prioridad percibida.'); return; }
    if(mensaje.length < 20){ showError(errorSugerencia, 'Describe tu sugerencia con al menos 20 caracteres.'); return; }

    var folio = 'CUC-' + state.programaCodigo + '-' + String(folioSeq).padStart(4,'0');
    folioSeq++;

    var registro = {
      folio: folio,
      fecha: new Date().toLocaleString('es-CO'),
      programa: state.programaNombre,
      semestre: state.semestre,
      categoria: categoria,
      prioridad: prioridadEl.value,
      mensaje: mensaje,
      anonimo: anonimo,
      nombre: anonimo ? '' : (nombre || 'No indicado')
    };
    submissions.push(registro);

    document.getElementById('tcFolio').textContent = folio;
    document.getElementById('folioMostrado').textContent = folio;
    document.getElementById('detalleConfirmacion').textContent =
      registro.categoria + ' · prioridad ' + registro.prioridad.toLowerCase() + ' · ' + registro.fecha;

    formSugerencia.style.display = 'none';
    confirmacion.classList.add('show');
    renderTabla();

    formSugerencia.reset();
    document.getElementById('nombre').disabled = false;
  });

  document.getElementById('btnOtraSugerencia').addEventListener('click', function(){
    confirmacion.classList.remove('show');
    formSugerencia.style.display = 'block';
  });

  document.getElementById('btnTerminar').addEventListener('click', function(){
    confirmacion.classList.remove('show');
    formVerificacion.style.display = 'block';
    formVerificacion.reset();
    state.verificado = false;
  });

  function renderTabla(){
    var conteo = document.getElementById('conteoRegistro');
    var contenido = document.getElementById('contenidoTabla');
    if(submissions.length === 0){
      conteo.textContent = 'Aún no se han registrado sugerencias.';
      contenido.innerHTML = '<p class="empty-log">Cuando envíes una sugerencia, aparecerá aquí.</p>';
      return;
    }
    conteo.textContent = submissions.length + (submissions.length === 1 ? ' sugerencia registrada' : ' sugerencias registradas');
    var rows = submissions.map(function(r){
      return '<tr><td>'+r.folio+'</td><td>'+r.programa+'</td><td>'+r.semestre+'</td><td>'+r.categoria+'</td><td>'+r.prioridad+'</td><td>'+r.fecha+'</td></tr>';
    }).join('');
    contenido.innerHTML = '<table class="log"><thead><tr><th>Folio</th><th>Programa</th><th>Semestre</th><th>Categoría</th><th>Prioridad</th><th>Fecha</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  function descargar(nombreArchivo, contenido, tipo){
    var blob = new Blob([contenido], {type: tipo});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nombreArchivo;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.getElementById('btnCSV').addEventListener('click', function(){
    if(submissions.length === 0) return;
    var header = 'Folio,Programa,Semestre,Categoria,Prioridad,Fecha,Anonimo,Nombre,Mensaje\n';
    var rows = submissions.map(function(r){
      var mensajeEsc = '"' + r.mensaje.replace(/"/g,'""') + '"';
      var nombreEsc = '"' + r.nombre.replace(/"/g,'""') + '"';
      return [r.folio, r.programa, r.semestre, r.categoria, r.prioridad, r.fecha, r.anonimo ? 'Sí':'No', nombreEsc, mensajeEsc].join(',');
    }).join('\n');
    descargar('buzon-cuc-escucha.csv', header + rows, 'text/csv;charset=utf-8;');
  });

  document.getElementById('btnJSON').addEventListener('click', function(){
    if(submissions.length === 0) return;
    descargar('buzon-cuc-escucha.json', JSON.stringify(submissions, null, 2), 'application/json;charset=utf-8;');
  });

  document.getElementById('btnVaciar').addEventListener('click', function(){
    if(submissions.length === 0) return;
    if(confirm('¿Vaciar todas las sugerencias registradas en esta sesión?')){
      submissions = [];
      folioSeq = 1;
      renderTabla();
    }
  });

  renderTabla();
})();
