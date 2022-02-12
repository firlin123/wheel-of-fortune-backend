import 'dotenv/config';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import PostsController from './posts/posts.controller';
import RollController from './roll/roll.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App(
    [
        new RollController(),
        new PostsController(),
        new AuthenticationController(),
    ],
);

app.listen();
