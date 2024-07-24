$(document).ready(async function () {
  await verifyToken();

  $(".estado-checkbox").change(async function () {
    const skaterId = $(this).val();
    const isChecked = $(this).prop("checked");

    try {
      const response = await axios.put(
        `http://localhost:3002/admin/skater?id=${skaterId}`,
        { estado: isChecked }
      );
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  });
});
//LOCALSTORAGE//
const idLocalStorage = localStorage.getItem("id");
var emailLocalStorage = localStorage.getItem("email");
var tokenLocalStorage = localStorage.getItem("token");
var nombreLocalStorage = localStorage.getItem("nombre");
var especialidadLocalStorage = localStorage.getItem("especialidad");
//VERIFICACION DE TOKEN PARA MOSTRAR NAV DISTINTO
const verifyToken = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3002/verifytoken?token=${tokenLocalStorage}`
    );

    if (response.data.success) {
      await printDatos();
      updateNavBar();
    }
  } catch (error) {
    console.error("Error en la solicitud:", error.message);
  }
};
//NAVBAR SEGUN TIPO ESPECIALIDAD, SE ASIGNA ESPECIALIDAD ADMINISTRADOR PARA LIMITAR ATRIBUCION
const updateNavBar = () => {
  var tokenLocalStorage = localStorage.getItem("token");
  var nombreLocalStorage = localStorage.getItem("nombre");
  var especialidadLocalStorage = localStorage.getItem("especialidad");
  if (nombreLocalStorage) {
    $(".navbar-nav").empty();
    let navContent = `
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="/perfil?token=${tokenLocalStorage}" id="perfilLink">${nombreLocalStorage}</a>
        </li>
    `;
    if (especialidadLocalStorage === "administrador") {
      navContent += `
        <li class="nav-item">
          <a class="nav-link" href="/admin?token=${tokenLocalStorage}&especialidad=${especialidadLocalStorage}" id="adminLink">Administración</a>
        </li>
      `;
    }
    navContent += `
        <li class="nav-item">
          <a class="nav-link" href="/logout" id="logoutLink">Cerrar sesión</a>
        </li>
      </ul>
    `;

    $("#navbarNav").append(navContent);

    $("#logoutLink").click(async function (event) {
      event.preventDefault();
      await axios.get(
        `http://localhost:3002/logout?token=${tokenLocalStorage}`
      );
      localStorage.clear();
      window.location.href = "/";
    });
  }
};
//REGISTRO SKATER
$("#btnSubmitRegist").click(function (event) {
  event.preventDefault();

  const email = $("#email").val();
  const nombre = $("#nombre").val();
  const password = $("#password").val();
  const repeat_password = $("#repeat_password").val();
  const anos_experiencia = $("#anos_experiencia").val();
  const especialidad = $("#especialidad").val();
  const foto = $("#foto")[0].files[0];
  if (
    validationData(
      email,
      nombre,
      password,
      repeat_password,
      anos_experiencia,
      especialidad,
      foto
    )
  ) {
    const formData = new FormData($("#registerForm")[0]);
    sendData(formData);
  }
});
const validationData = async (
  email,
  nombre,
  password,
  repeat_password,
  anos_experiencia,
  especialidad,
  foto
) => {
  if (
    !email ||
    !nombre ||
    !password ||
    !repeat_password ||
    !anos_experiencia ||
    !especialidad ||
    !foto
  ) {
    return toastAlert("Debes ingresar todos los datos", "hidden");
  } else if (password != repeat_password) {
    return toastAlert("Contraseñas no coinciden", "hidden");
  }
};
//ENVIO DATOS REGISTRO
const sendData = async (formData) => {
  try {
    const response = await axios.post("/skaters", formData);
    toastAlert("¡Registro exitoso! Ahora podrás iniciar sesión.");

    setTimeout(function () {
      window.location.href = "/login";
    }, 3000); //
  } catch (error) {
    console.error("Error al enviar los datos:", error);
    toastAlert(`${error.response.data.message}`, "hidden");
  }
};
//LOGIN SKATER - USUARIO/SKATER
$("#form-login").submit(async function (event) {
  event.preventDefault();
  const emailForm = $("#email").val();
  const passwordForm = $("#password").val();
  if (!emailForm || !passwordForm) {
    toastAlert("Faltan datos", "hidden");
  }
  try {
    const response = await axios.post(`http://localhost:3002/login`, {
      email: emailForm,
      password: passwordForm,
    });
    const tokenRes = response.data.token;
    console.log("Response user:", response.data.user); //
    localStorage.setItem("id", response.data.user.id);
    localStorage.setItem("token", tokenRes);
    localStorage.setItem("email", emailForm);

    toastAlert("¡Inicio de sesión exitoso!");
    setTimeout(function () {
      window.location.href = `/perfil?token=${tokenRes}`;
    }, 3000);
  } catch (error) {
    toastAlert("Email o contraseña no válida", "hidden");
  }
});
//IMPRIME DATOS DEL PERFIL DE USUARIO/SKATER
const printDatos = async () => {
  const response = await axios.get(
    `http://localhost:3002/dataPerfil?token=${tokenLocalStorage}`,
    {
      params: {
        email: emailLocalStorage,
      },
    }
  );

  localStorage.setItem("nombre", response.data.user.nombre);
  localStorage.setItem("especialidad", response.data.user.especialidad);
  $("#emailPerfil").val(response.data.user.email);
  $("#nombrePerfil").val(response.data.user.nombre);
  $("#passwordPerfil").val(response.data.user.password);
  $("#passRepeatPerfil").val(response.data.user.password);
  $("#aniosPerfil").val(response.data.user.anos_experiencia);
  $("#especialidadPerfil").val(response.data.user.especialidad);
};
//ACTUALIZACION
$("#btnSubmitPerfil").click(async function (event) {
  event.preventDefault();

  const nombreUpdate = $("#nombrePerfil").val();
  const passwordUpdate = $("#passwordPerfil").val();
  const passwordRepeatUpdate = $("#passRepeatPerfil").val();
  const aniosExpUpdate = $("#aniosPerfil").val();
  const especialidadUpdate = $("#especialidadPerfil").val();
  if (
    !nombreUpdate ||
    !passwordUpdate ||
    !passwordRepeatUpdate ||
    !aniosExpUpdate ||
    !especialidadUpdate
  ) {
    return toastAlert("Debes ingresar todos los datos", "hidden");
  } else if (passwordUpdate != passwordRepeatUpdate) {
    return toastAlert("Contraseñas no coinciden", "hidden");
  }
  try {
    const response = await axios.put(
      `http://localhost:3002/skater?id=${idLocalStorage}`,
      {
        nombre: nombreUpdate,
        password: passwordUpdate,
        anos_experiencia: aniosExpUpdate,
        especialidad: especialidadUpdate,
      }
    );
    localStorage.setItem("nombre", nombreUpdate);
    toastAlert("Datos actualizados", "hidden");
    await printDatos();
    await verifyToken();
  } catch (error) {
    console.error(error);
    toastAlert("Error al actualizar datos", "hidden");
  }
});
//ELIMINA PERFIL
$("#btnEliminarPerfil").click(function (event) {
  event.preventDefault();
  $("#confirmModal").modal("show");
});
//ELIMINA PERFIL - CONFIRMACION ACCION
$("#confirmDeleteBtn").click(async function () {
  try {
    const response = await axios.delete(
      `http://localhost:3002/skater?id=${idLocalStorage}`
    );
    toastAlert("Eliminando usuario");
    localStorage.clear();
    setTimeout(function () {
      window.location.href = `/`;
    }, 3000);
    
  } catch (error) {
    console.error(error);
    toastAlert("Error al eliminar usuario", "hidden");
  } finally {
    $("#confirmModal").modal("hide");
  }
});
//TOAST GENERICO
function toastAlert(message, hidden) {
  $("#toastContainer").empty();
  const toast = `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000">
      <div class="toast-header">
          <strong class="me-auto">ToastAlert</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>
      <div class="toast-body">
          <div class="spinner-border text-primary me-2" role="status" ${hidden}>
              <span class="visually-hidden"></span>
          </div>
          ${message}
      </div>
  </div>`;
  $("#toastContainer").append(toast);
  $(".toast").toast("show");
  $("#exampleModal").modal("hide");
}
