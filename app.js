const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// dossier public
app.use(express.static(path.join(__dirname, 'public')));

// route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// get all users
app.get('/api/users', (req, res) => {
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(JSON.parse(data));
  });
});

// get user by id
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile('users.json', 'utf8', (err, data) => {
    const users = JSON.parse(data);
    const user = users.find(u => u.id === id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
  });
});

// add user
app.post('/api/users', (req, res) => {
  const newUser = req.body;

  if (!newUser.nom || !newUser.prenom) {
    return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  }

  fs.readFile('users.json', 'utf8', (err, data) => {
    const users = JSON.parse(data);

    const maxId = Math.max(...users.map(u => u.id), 0);
    newUser.id = maxId + 1;

    users.push(newUser);

    fs.writeFile('users.json', JSON.stringify(users, null, 2), err => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.status(201).json(newUser);
    });
  });
});

// 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// start server
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});