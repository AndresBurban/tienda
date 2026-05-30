const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

// Para permitir que los tests cierren el servidor
module.exports = server;
