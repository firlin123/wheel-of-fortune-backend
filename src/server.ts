import 'dotenv/config';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import RollController from './roll/roll.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App(
    [
        new RollController(),
        new AuthenticationController(),
    ],
);

app.listen();
