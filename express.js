const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: 'postgres://nnxlbcackkirgn:7d872574bcac59d7ca34a4682109da44645cdcd8f75fd23f8f8e68e2c21d704b@ec2-3-208-74-199.compute-1.amazonaws.com:5432/d38ol91lqdu71i',
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Connected to the schools database.');
defineRoutes();

function defineRoutes() {
  app.get('/vote', async (req, res) => {
    const schoolId = Number(req.query.schoolId);

    if (isNaN(schoolId)) {
      res.status(400).send({message: 'Invalid schoolId'});
      return;
    }

    console.log('Received schoolId: ', schoolId);
    let sql = `UPDATE Schools 
               SET likes = likes + 1 
               WHERE id = $1`;

    try {
      await pool.query(sql, [schoolId]);
      console.log(`School with ID: ${schoolId} has received a vote`);

      // After updating the likes count in the database, 
      // retrieve the updated likes count and send it as a JSON response
      sql = `SELECT likes FROM Schools WHERE id = $1`;
      const { rows } = await pool.query(sql, [schoolId]);
      console.log('Received row: ', rows[0]);
      res.json({likes: rows[0].likes});
    } catch (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  });

  app.get('/schools', async (req, res) => {
    let sql = 'SELECT * FROM Schools';

    try {
      const { rows } = await pool.query(sql);
      if (rows.length > 0) {
        res.send(rows);
      } else {
        res.status(404).send({message: 'No schools found'});
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  });

  app.get('/schools/:id', async (req, res) => {
    const schoolId = Number(req.params.id);

    if (isNaN(schoolId)) {
      res.status(400).send({ message: 'Invalid schoolId' });
      return;
    }

    let sql = 'SELECT * FROM Schools WHERE id = $1';
    try {
      const { rows } = await pool.query(sql, [schoolId]);
      if (rows.length > 0) {
        res.send(rows[0]);
      } else {
        res.status(404).send({ message: 'No school found with given ID' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  });

  const port = 3000;
  app.listen(process.env.PORT || port, () => console.log(`Server listening at http://localhost:${port}`));
}
