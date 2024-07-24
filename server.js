const express = require("express");
const axios = require("axios");
const app = express();
const expressFileUpload = require("express-fileupload");
const exphbs = require("express-handlebars");

/*JWT*/
const jwt = require("jsonwebtoken"); //
const secretKey = "keyPassSecret"; //
const validTokens = new Set();

// DB
const {
  postSkaters,
  getDataUser,
  getSkaters,
  verifyCredentials,
  putSkaters,
  putSkatersAdmin,
  deleteSkater,
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
    helpers: {
      capitalize: (str) => {
        if (typeof str === "string") {
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return str;
      },
    },
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
app.use(
  "/bootstrap_css",
  express.static(__dirname + "/node_modules/bootstrap/dist/css")
);
app.use("/bootstrap_js", express.static("./node_modules/bootstrap/dist/js"));

// Middleware CONVIERTE EN OBJETOS JS ACCECIBLES POR req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware PARA VER SOLICITUDES ENTRANTES
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});
// Middleware VERIFICACION TOKEN PARA VISTAS PROTEGIDAS
const verifyTokenMdlwr = (req, res, next) => {
  const token = req.query.token;
  console.log("Token recibido: ", token);

  if (!token) {
    return res.status(403).redirect("/");
  }

  if (!validTokens.has(token)) {
    console.log("Token no válido");
    return res.status(401).redirect("/");
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("Error de verificación de token:", err);
      return res.status(401).redirect("/");
    }
    req.user = decoded.data;
    next();
  });
};
//VISTA RAIZ CON TABLA DATOS
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
//VISTA LOGIN
app.get("/login", async (req, res) => {
  res.render("login", { layout: "main" });
});
//VISTA REGISTRO
app.get("/register", async (req, res) => {
  res.render("registro", { layout: "main" });
});
//VISTA MODIFICACION DATOS PERFIL - NECESITA TOKEN
app.get("/perfil", verifyTokenMdlwr, async (req, res) => {
  res.render("datos", { layout: "main" });
});
//VISTA ADMINSTRADOR DE TABLA - NECESITA TOKEN
app.get("/admin", verifyTokenMdlwr, async (req, res) => {
  const especialidad = req.query.especialidad;
  console.log(especialidad);
  try {
    if (especialidad == "administrador") {
      const result = await getSkaters();
      res.render("admin", { result, layout: "main" });
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.error("Error al obtener skaters:", error);
    return res.redirect("/");
  }
});
//GET TODOS LOS SKATERS
app.get("/skaters", async (req, res) => {
  try {
    const result = await getSkaters();
    res.render("index", { result });
  } catch (error) {
    console.error("Error al obtener getData", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al obtener getData" });
  }
});
//POST SKATER
app.post("/skaters", async (req, res) => {
  try {
    const {
      email,
      nombre,
      password,
      repeat_password,
      anos_experiencia,
      especialidad,
    } = req.body;
    if (
      !email ||
      !nombre ||
      !password ||
      !repeat_password ||
      !anos_experiencia ||
      !especialidad
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios.",
      });
    }

    if (password !== repeat_password) {
      return res
        .status(400)
        .json({ success: false, message: "Las contraseñas no coinciden." });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No se ha subido ninguna imagen." });
    }

    let foto = req.files.foto;
    const uploadPath = __dirname + "/public/uploads/" + foto.name;

    foto.mv(uploadPath, async function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const data = {
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad,
        foto: `/uploads/${foto.name}`, //RUTA
      };
      await postSkaters(data);

      res.status(200).json({ success: true, message: "Registro exitoso." });
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
});
//VALIDACION DATOS LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await verifyCredentials(email, password);
    if (user) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 7200,
          data: user,
        },
        secretKey
      );
      validTokens.add(token);
      res.json({ success: true, user: user, token });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error en el servidor al iniciar sesión" });
  }
});
//GET DATA USUARIO PARA LA VISTA PERFIL, COMPARA EL DATO DEL TOJKEN EN EL MDLWR
app.get("/dataPerfil", verifyTokenMdlwr, async (req, res) => {
  try {
    const userFromToken = req.user;
    const user = await getDataUser(userFromToken.email);

    if (
      user &&
      (user.nombre !== userFromToken.nombre ||
        user.email !== userFromToken.email ||
        user.anos_experiencia !== userFromToken.anos_experiencia ||
        user.especialidad !== userFromToken.especialidad)
    ) {
      const newToken = jwt.sign({ data: user }, secretKey, { expiresIn: "2h" });

      res.json({ success: true, user: user, token: newToken });
    } else {
      res.json({ success: true, user: userFromToken });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});
//PUT SKATER
app.put("/skater", async (req, res) => {
  try {
    const { id } = req.query;
    const { nombre, password, anos_experiencia, especialidad } = req.body;

    console.log("Datos recibidos para actualizar:", {
      id,
      nombre,
      password,
      anos_experiencia,
      especialidad,
    });

    const data = {
      id: id,
      nombre: nombre,
      password: password,
      anos_experiencia: anos_experiencia,
      especialidad: especialidad,
    };

    const resultado = await putSkaters(data);

    console.log("Resultado de la actualización:", resultado);

    res.status(200).json({ success: true, message: "Editado correctamente" });
  } catch (error) {
    console.error("Error al editar data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al editar data" });
  }
});
//PUT SKATER ADMINISTRADOR
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
//ELIMINA SKATER
app.delete("/skater", async (req, res) => {
  const { id } = req.query;
  const response = await deleteSkater(id);
  console.log(response);
  res.status(200).json({ success: true, message: "Eliminado correctamente" });
});
//CIERRA SESION
app.get("/logout", verifyTokenMdlwr, async (req, res) => {
  const token = req.query.token;
  validTokens.delete(token);
  res.redirect("/");
});
//VERIFICA TOKEN PARA MOSTRAR DATOS SEGUN TIPO 
app.get("/verifytoken", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "400 Bad Request",
      message: "Token no proporcionado",
    });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: "401 Unauthorized",
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Autorizado",
      user: decoded.data, // Enviar los datos decodificados si es necesario
    });
  });
});
