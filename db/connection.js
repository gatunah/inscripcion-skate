const { Pool } = require("pg");

// CONFIG BD
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "skatepark",
  password: "admin",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 40000,
  connectionTimeoutMillis: 3010,
});

const getSkaters = async () => {
  try {
    const result = await pool.query("SELECT * FROM skaters ORDER BY id ASC");
    return result.rows;
  } catch (error) {
    console.error("Error al obtener datos", error);
  }
};

const postSkaters = async (data) => {
  const { email, nombre, password, anos_experiencia, especialidad, foto} = data;
  try {
    const consult = {
      text: "INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1,$2,$3,$4,$5,$6, false) RETURNING *;",
      values: [email, nombre, password, anos_experiencia, especialidad, foto],
    };
    const result = await pool.query(consult);
    return result;
  } catch (error) {
    console.error("Error al insertar datos:", error);
  }
};
const putSkaters = async (data) => {
  const { id, nombre, password, anos_experiencia, especialidad } = data;

  try {
    const query = {
      text: `UPDATE skaters 
               SET nombre = $1, 
                   password = $2, 
                   anos_experiencia = $3, 
                   especialidad = $4 
               WHERE id = $5 RETURNING *;`,
      values: [nombre, password, anos_experiencia, especialidad, id],
    };

    const result = await pool.query(query);

    if (result.rowCount === 0) {
      throw new Error(`Skater with ID ${id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating skater data:", error);
    throw error;
  }
};
const putSkatersAdmin = async (data) => {
  const { id, estado } = data;

  try {
    const query = {
      text: `UPDATE skaters 
               SET estado = $1
               WHERE id = $2 ;`,
      values: [estado, id],
    };

    const result = await pool.query(query);

    if (result.rowCount === 0) {
      throw new Error(`Skater with ID ${id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating skater data:", error);
    throw error;
  }
};

const getDataUser = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM skaters WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
const verifyCredentials = async (email, password) => {
  try {
    const result = await pool.query("SELECT * FROM skaters WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.password === password) {
        //console.log(user);
        return user;
      } else {
        throw new Error("Invalid password");
      }
    } else {
      throw new Error("User not found"); //<0
    }
  } catch (error) {
    console.error("Error verifying credentials:", error);
    throw error;
  }
};
const deleteSkater = async (id) => {
  try{
    const result = await pool.query("DELETE FROM skaters WHERE id = $1", 
      [id]
    );
    return result;
  }catch (error){
    console.error("Error:", error);
    throw error;
  }
}
module.exports = {
  getSkaters,
  getDataUser,
  postSkaters,
  verifyCredentials,
  putSkaters,
  putSkatersAdmin,
  deleteSkater
};
