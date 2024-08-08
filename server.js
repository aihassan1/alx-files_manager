import express from 'express';
import { env } from 'process';
import routes from './routes/index.js';

const app = express();

const port = env.PORT || 5000;

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
