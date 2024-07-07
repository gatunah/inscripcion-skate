$(document).ready(async function () {
    $('.estado-checkbox').change(async function() {
        const skaterId = $(this).val(); // ID
        const isChecked = $(this).prop('checked');//bool
        //console.log(skaterId, isChecked);
        try {
            const response = await axios.put(`http://localhost:3002/admin/skater?id=${skaterId}`, 
            { estado: isChecked });
            console.log(response.data);
          } catch (error) {
            console.error('Error al actualizar el estado:', error);
          }
          
    })
    
});

$('#btnSubmitRegist').click(function (event) {
  event.preventDefault(); 

  const email = $("#email").val();
  const nombre = $("#nombre").val();
  const password = $("#password").val();
  const repeat_password = $("#repeat_password").val();
  const anos_experiencia = $("#anos_experiencia").val();
  const especialidad = $("#especialidad").val();
  const foto =  $("#foto")[0].files[0];
  //console.log(email, nombre, password, repeat_password, anos_experiencia, especialidad, foto);

  if (validationData(email, nombre, password, repeat_password, anos_experiencia, especialidad, foto)) {
    const formData = new FormData($("#registerForm")[0]);
    console.log(formData);
    sendData(formData);
  }
});

const validationData = async(email, nombre, password, repeat_password, anos_experiencia, especialidad, foto) =>{
  if (!email || !nombre || !password || !repeat_password || !anos_experiencia || !especialidad || !foto) {
    return toastAlert("Debes ingresar todos los datos", "hidden")
  }
  else if (password != repeat_password){
    return toastAlert("Contraseñas no coinciden", "hidden")
  }
}

async function sendData(formData) {
  try {
    const response = await axios.post("/skaters", formData);
    console.log(response.data);

    toastAlert("¡Registro exitoso! Ahora podrás iniciar sesión.");

    setTimeout(function() {
      
      window.location.href = "/login";
    }, 3000); // 


  } catch (error) {
    console.error('Error al enviar los datos:', error);
  }
}

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
