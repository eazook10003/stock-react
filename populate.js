const fs = require('fs');
const { Client } = require('pg');

let rawdata = fs.readFileSync('simplifiedHighschool.json');
let data = JSON.parse(rawdata);

let schools = data.map((school, index) => {
    return { id: index + 1, name: school.name, likes: Math.floor(Math.random() * 100) };
});

const client = new Client({
    connectionString: 'postgres://nnxlbcackkirgn:7d872574bcac59d7ca34a4682109da44645cdcd8f75fd23f8f8e68e2c21d704b@ec2-3-208-74-199.compute-1.amazonaws.com:5432/d38ol91lqdu71i',
    ssl: {
      rejectUnauthorized: false
    }
  });
  

client.connect();

client.query('CREATE TABLE IF NOT EXISTS Schools(id INT PRIMARY KEY, name TEXT, likes INT)', (err, res) => {
  if (err) {
    console.error(err);
    return;
  }

  let stmt = 'INSERT INTO Schools(id, name, likes) VALUES($1, $2, $3)';
  schools.forEach(school => {
    client.query(stmt, [school.id, school.name, school.likes], (err, res) => {
      if(err) {
        console.error(err);
      } else {
        console.log('Inserted:', school);
      }
    });
  });
});

