let pagina = 1;

const cita = {
    nombre = '',
    fecha = '',
    hora = '',
    servicios = [],
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarServicios();

    // Resalta el Div actual segun el tab al que se presiona
    mostrarSeccion()

    // Oculta o muestra una seccion segun el tab al que se presiona
    cambiarSeccion();

    //Paginacion siguiente y anterior
    paginaSiguiente();

    paginaAnterior();

    // Comprueba la pagina actual para ocultar o mostrar la paginacion
    botonesPaginador();

    // Muestra el resumen de la cita o error en caso de no pasar validacion
    mostrarResumen();

    // Almacena el nombre de la cita en el objeto
    nombreCita();

    // Almacena la fecha de la cita en el objeto
    fechaCita();
    
    // Deshabilita dias pasados
    deshabilitarFechaAnterior();

    // Almacena la hora de la cita el objeto
    horaCita();
}

function mostrarSeccion() {
    // Elimina mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion')
    if( seccionAnterior ) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }
        
    // Agrega mostrar-seccion en la nueva seccion
    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    // Elimina la clase actual del tab anterior
    const tabAnterior = document.querySelector('.tabs button.actual');
    if( tabAnterior ) {
        tabAnterior.classList.remove('actual');
    }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso = "${pagina}"]`); // Entre corchetes porque es un atributo.
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);

            // Llamar la funcion de mostrarSeccion()
            mostrarSeccion();
            botonesPaginador();
        })
    })
}

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();

        //console.log(db.servicios);

        const { servicios } = db; // Destructuring

        // Generar el HTML

        servicios.forEach(servicio => {
            const { id, nombre, precio } = servicio; // Hago destruct otra vez para no andar llamando a servicio.id, etc...

            // DOM Scripting

            // Generar nombre del servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            // Generar precio del servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');
            
            //Generar div contenedor del servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            //Selecciona un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;


            // Inyectar precio y nombre al div de Servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //Inyectarloen el HTML
            document.querySelector('#servicios').appendChild(servicioDiv);
        });
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    let elemento;
    // Forzar que el elemento al cual le damos click sea el DIV

    if(e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }
    if(elemento.classList.contains('seleccionado')) {
        elemento.classList.remove('seleccionado');

        const id = parseInt( elemento.dataset.idServicio );

        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent,
        }
        //console.log(servicioObj);
        agregarServicio(servicioObj);
    }
}

function agregarServicio(servicioObj) {
    const { servicios } = cita;
    cita.servicios = [...servicios, servicioObj]; // Copia el array de servicios y le agrega el nuevo
}

function eliminarServicio(id) {
    const { servicios } = cita;
    cita.servicios = servicios.filter( servicio => servicio.id !== id); // Me devuelve solo los servicios que son distintos al ID
}


function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;
        botonesPaginador(); // Para que vaya actualizando el numero de pagina, sino siempre queda en pagina = 1
    });
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;
        botonesPaginador(); // Para que vaya actualizando el numero de pagina, sino siempre queda en pagina = 1
    });
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');
    if( pagina === 1){
        paginaAnterior.classList.add('ocultar');
    } else if( pagina === 3){
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');
        mostrarResumen();
    } else {
        paginaSiguiente.classList.remove('ocultar');
        paginaAnterior.classList.remove('ocultar');
    }

    mostrarSeccion(); // Cambia la seccion que se muestra por la de la pagina
}

function mostrarResumen() {
    // Destructuring
    const {nombre, fecha, hora, servicios} = cita;

    // Seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    // Limpia el HTML previo

    while( resumenDiv.firstChild ) { // Mientras .contenido-resumen tenga contenido HTML dentro.
        resumenDiv.removeChild( resumenDiv.firstChild );
    }

    // Validacion de objeto
    if(Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicios, hora, fecha o nombre';

        noServicios.classList.add('invalidar-cita');

        // Agregar a resumenDiv
        resumenDiv.appendChild(noServicios);

        return;
    } 

    // Mostrar el resumen

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';

    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span>  ${nombre}`; // innerHTML agrega lo que es el HTML dentro del elemento que creamos  || textContent coloca las etiquetas HTML como si fueran texto

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span>  ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span>  ${hora}`;

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;
    // Mostrar los servicios
    servicios.forEach( servicio => {
        const { nombre, precio } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');

        cantidad += parseInt( totalServicio[1].trim());

        // Colocamos texto y precio en el DIV
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    });

    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);
    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a pagar: </span>$ ${cantidad}`;

    resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', e => {
        const nombreTexto = e.target.value.trim(); // trim() elimina los espaciones en blanco al inicio y final
        
        // Validacion de que nombreTexto debe tener algo
        if( nombreTexto === '' || nombreTexto.length < 3) {
            mostrarAlerta('Nombre no valido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if( alerta ) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
    })
}

function mostrarAlerta(mensaje, tipo) {

    // Si hay una alerta previa no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if( alertaPrevia ) {
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if( tipo === 'error') {
        alerta.classList.add('error');
    }
    
    // Insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild (alerta );

    // Eliminar la alerta despues de 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e => {
        const dia = new Date(e.target.value).getUTCDay();

        if([0, 1].includes(dia)) { // Si Domingo o Lunes
            e.preventDefault();
            fechaInput.value = ''; // Para que no me muestre la fecha invalida en el input.
            mostrarAlerta('Domingo y Lunes no abrimos.', 'error');
        } else {
            cita.fecha = fechaInput.value;
            console.log(cita);
        }

        // const opciones = {
        //     weekday: 'long',
        //     year: 'numeric',
        //     month: 'long'
        // }
        // console.log(dia.toLocaleDateString('es-ES', opciones));
    })
}

function deshabilitarFechaAnterior() {
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;
    const dia = fechaAhora.getDate(); // Si quiero reservar a partir del proximo dia le pongo + 1

    // Formato deseado: AAAA-MM-DD

    const fecha = `${year}-0${mes}-${dia}`;
    
    inputFecha.min = fecha;
}

function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {

        const horaCita = e.target.value;
        const hora = horaCita.split(':'); // Desarmo la hora en 2 partes, hora y minutos

        if( hora[0] < 10 || hora[0] > 19) {
            mostrarAlerta('Hora no valida', 'error');
            setTimeout(() => {
                inputHora.value = '';
            }, 3000);
        } else {
            cita.hora = horaCita;
        }
    })
}