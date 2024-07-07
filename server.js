const express = require("express");
const axios = require("axios");
const app = express();
const expressFileUpload = require("express-fileupload"); //
const exphbs = require("express-handlebars");

// DB
const {
  postSkaters,
  getSkaters,
  verifyCredentials,
  putSkaters,
  putSkatersAdmin,
} = require("./db/connection");

const port = 3002;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.engine(
  "handlebars",
  exphbs.engine({
    //defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.set("view engine", "handlebars");

app.use(
  expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit:
      "El peso del archivo que intentas subir supera el limite permitido",
  })
);

//ESTATICOS
app.use(express.static("public"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/axios", express.static(__dirname + "/node_modules/axios/dist"));
// app.use("/uuid", express.static(__dirname + "/node_modules/uuid/dist"));
app.use(
  "/bootstrap_css",
  express.static(__dirname + "/node_modules/bootstrap/dist/css")
);
app.use("/bootstrap_js", express.static("./node_modules/bootstrap/dist/js"));
// app.use(
//   "/fontawesome",
//   express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free")
// );

// Middleware CONVIERTE EN OBJETOS JS ACCECIBLES POR req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware PARA VER SOLICITUDES ENTRANTES
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

//VISTA PRINCIPAL INDEX CON DATOS TABLAS
app.get("/", async (req, res) => {
  try {
    const result = await getSkaters();
    res.render("index", { result, layout: "main" });
  } catch (error) {
    console.error("Error al obtener skaters:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al obtener skaters" });
  }
});

app.get("/login", async (req, res) => {
  res.render("login", { layout: "main" });
});

app.get("/register", async (req, res) => {
  res.render("registro", { layout: "main" });
});
app.get("/admin", async (req, res) => {
  try {
    const result = await getSkaters();
    res.render("admin", { result, layout: "main" });
  } catch (error) {
    console.error("Error al obtener skaters:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al obtener skaters" });
  }
});

app.get("/skaters", async (req, res) => {
  try {
    const result = await getSkaters();
    //console.log(result);
    // res.json(result); //DEVUELVE JSON
    res.render("index", { result });
  } catch (error) {
    console.error("Error al obtener getData", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al obtener getData" });
  }
});
app.post('/skaters', async (req, res) => {
  try {
    const { email, nombre, password, repeat_password, anos_experiencia, especialidad } = req.body;
    if (!email || !nombre || !password || !repeat_password || !anos_experiencia || !especialidad) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    if (password !== repeat_password) {
      return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen.' });
    }

    let foto = req.files.foto;
    const uploadPath = __dirname + '/public/uploads/' + foto.name;

    foto.mv(uploadPath, async function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const data = {
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad,
        foto: `/uploads/${foto.name}` //RUTA
      };
      await postSkaters(data);

      res.status(200).json({ success: true, message: 'Registro exitoso.' });
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await verifyCredentials(email, password);

    // // Crear un token JWT
    // const token = jwt.sign(
    //   { id: user.id, email: user.email, nombre: user.nombre },
    //   secretKey,
    //   { expiresIn: '2h' } // El token expira en 2 horas
    // );

    // res.json({ success: true, token });
    res.json({ success: true });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
});
app.put("/skater", async (req, res) => {
  try {
    const { id } = req.query;
    const { nombre, password, anos_experiencia, especialidad } = req.body;

    const data = {
      id: id,
      nombre: nombre,
      password: password,
      anos_experiencia: anos_experiencia,
      especialidad: especialidad,
    };

    const resultado = await putSkaters(data);

    res.status(200).json({ success: true, message: "Editado correctamente" });
  } catch (error) {
    console.error("Error al editar data:", error);
    let statusCode = 500;
    let errorMessage = "Error interno al editar data";

    if (error.message.includes("not found")) {
      statusCode = 404;
      errorMessage = error.message;
    }

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
});
app.put("/admin/skater", async (req, res) => {
  try {
    const { id } = req.query;
    const { estado } = req.body;

    const data = {
      id: id,
      estado,
      estado,
    };

    const resultado = await putSkatersAdmin(data);

    res.status(200).json({ success: true, message: "Editado correctamente" });
  } catch (error) {
    console.error("Error al editar data:", error);
    let statusCode = 500;
    let errorMessage = "Error interno al editar data";

    if (error.message.includes("not found")) {
      statusCode = 404;
      errorMessage = error.message;
    }

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
});
