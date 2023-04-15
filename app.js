const express = require('express');
const app = express();


app.get('/api/data/', (req, res) => {
    const date = req.query.date;
    res.send(`Date you selected is ${date}`);
  });

  
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
  