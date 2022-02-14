import 'dotenv/config';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import EnvType from 'utils/env.type';
import RollController from './roll/roll.controller';
import validateEnv from './utils/validateEnv';

let validatedEnv: EnvType = validateEnv();

const app = new App(
    [
        new RollController(),
        new AuthenticationController(),
    ],
    validatedEnv
);

app.listen();