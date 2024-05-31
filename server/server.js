// backend/server.js

const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
  
  db.query('CREATE DATABASE IF NOT EXISTS photo_album', (err) => {
    if (err) throw err;
    console.log('Database photo_album created or already exists.');

    db.query('USE photo_album', (err) => {
      if (err) throw err;
      console.log('Using database photo_album');

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image VARCHAR(255) NOT NULL
        )
      `;
      db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log('Table images created or already exists.');
      });
    });
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  const image = req.file.filename;
  const sql = 'INSERT INTO images (image) VALUES (?)';
  db.query(sql, [image], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Image uploaded successfully', image });
  });
});

app.get('/images', (req, res) => {
  const sql = 'SELECT * FROM images';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


app.delete('/images/:id', (req, res) => {
  const { id } = req.params;
  const getImageQuery = 'SELECT image FROM images WHERE id = ?';
  const deleteImageQuery = 'DELETE FROM images WHERE id = ?';

  db.query(getImageQuery, [id], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const image = results[0].image;
    const imagePath = path.join(__dirname, 'uploads', image);

    db.query(deleteImageQuery, [id], (err) => {
      if (err) throw err;

      fs.unlink(imagePath, (err) => {
        if (err) throw err;
        res.json({ message: 'Image deleted successfully' });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
