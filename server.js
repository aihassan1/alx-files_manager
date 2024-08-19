import express from 'express';
import { env } from 'process';
import routes from './routes/index';
import bodyParser from 'body-parser'; // Import body-parser

const app = express();


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const port = env.PORT || 5000;

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
