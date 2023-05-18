const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


let db = new sqlite3.Database('./db/schools.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
    console.error(err.message);
  }
  console.log('Connected to the schools database.');
  defineRoutes();
});
  

function defineRoutes() {
    app.get('/vote', (req, res) => {
        const schoolId = Number(req.query.schoolId);
      
        if (isNaN(schoolId)) {
          res.status(400).send({message: 'Invalid schoolId'});
          return;
        }
      
        console.log('Received schoolId: ', schoolId);
        let sql = `UPDATE Schools 
                   SET likes = likes + 1 
                   WHERE id = ?`;
      
        db.run(sql, schoolId, function(err) {
          if (err) {
            console.error(err.message);
            res.status(500).send(err.message);
          } else {
            console.log(`School with ID: ${schoolId} has received a vote`);
            // After updating the likes count in the database, 
            // retrieve the updated likes count and send it as a JSON response
            db.get(`SELECT likes FROM Schools WHERE id = ?`, [schoolId], (err, row) => {
              if (err) {
                console.error(err.message);
                res.status(500).send(err.message);
              } else {
                console.log('Received row: ', row);
                res.json({likes: row.likes});
              }
            });
          }
        });
      });
      

  app.get('/schools', (req, res) => {
      let sql = 'SELECT * FROM Schools';

      db.all(sql, [], (err, rows) => {
        if (err) {
          return console.error(err.message);
        }
        if (rows) {
          res.send(rows);
        } else {
          res.status(404).send({message: 'No schools found'});
        }
      });
  });

  app.get('/schools/:id', (req, res) => {
    const schoolId = Number(req.params.id);
  
    if (isNaN(schoolId)) {
      res.status(400).send({ message: 'Invalid schoolId' });
      return;
    }
  
    let sql = 'SELECT * FROM Schools WHERE id = ?';
    db.get(sql, [schoolId], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        res.send(row);
      } else {
        res.status(404).send({ message: 'No school found with given ID' });
      }
    });
  });
  

  const port = 3000;
  app.listen(process.env.PORT || port, () => console.log(`Server listening at http://localhost:${port}`));
}
