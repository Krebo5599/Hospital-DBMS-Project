const express = require('express');
const mongodb = require('mongodb');
const { connectToDb, getDb } = require('./db');

const app = express();
let db;

connectToDb((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process if unable to connect to the database
  }
  
  db = getDb();
  app.listen(3001, () => {
    console.log('Server connected and listening on port 3001');
  });
});

app.use(express.json());


// Route to get all patients
app.get('/patients', async (req, res) => {
  try {
    const patients = await db.collection('Patients').find().toArray();
    res.status(200).json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Could not fetch the documents' });
  }
});

// Route to get a single patient by ID
app.get('/patients/:id', async (req, res) => {
  try {
    const patient = await db.collection('Patients').findOne({ _id: new mongodb.ObjectId(req.params.id) });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Could not fetch the document' });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
