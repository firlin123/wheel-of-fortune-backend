import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http'
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as ws from 'ws';
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';
import { IncomingMessage } from 'connect';

class App {
    public app: express.Application;
    public server: http.Server;
    private proxyWebSockets: boolean = false;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
        this.initializeStaticFiles();
    }

    public listen() {
        this.server = this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
        if (this.proxyWebSockets) {
            this.setupWebSocketsProxy();
        }
    }

    private setupWebSocketsProxy() {
        const {
            DEV_PROXY_HOST,
            DEV_PROXY_PORT
        } = process.env;
        const wsServer: ws.Server = new ws.Server({ server: this.server });

        wsServer.on('connection', (client: ws, req: IncomingMessage) => {
            console.log('[Proxy] WebSocket: ' + req.url);
            let server: ws = new ws.WebSocket(`ws://${DEV_PROXY_HOST}:${DEV_PROXY_PORT}${req.url}`, {
                headers: {
                    'origin': `http://${DEV_PROXY_HOST}:${DEV_PROXY_PORT}`
                }
            });
            client.on('message', (data, isBinary) => {
                try {
                    server.send(isBinary ? data : new TextDecoder().decode(data as ArrayBuffer));
                } catch (e) { }
            });
            server.on('message', (data, isBinary) => {
                try {
                    client.send(isBinary ? data : new TextDecoder().decode(data as ArrayBuffer));
                } catch (e) { }
            });
        });
    }

    private setupFilesProxy() {
        const {
            DEV_PROXY_HOST,
            DEV_PROXY_PORT
        } = process.env;

        this.proxyWebSockets = true;
        this.app.get('*', (clientReq, clientRes) => {
            console.log('[Proxy] File: ' + clientReq.url);
            var options: http.RequestOptions = {
                hostname: DEV_PROXY_HOST,
                port: DEV_PROXY_PORT,
                path: clientReq.url,
                method: clientReq.method,
                headers: clientReq.headers
            };
            var proxy: http.ClientRequest = http.request(options, (res: http.IncomingMessage) => {
                clientRes.writeHead(res.statusCode, res.headers)
                res.pipe(clientRes, { end: true });
            });
            clientReq.pipe(proxy, { end: true });
        });
    }

    private initializeStaticFiles() {
        if (process.env.NODE_ENV === 'development') {
            this.setupFilesProxy();
        } else {
            this.app.use(express.static(path.resolve('static')));
            this.app.get('*', (request, response) => {
                response.sendFile(path.resolve('static', 'index.html'));
            });
        }
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private connectToTheDatabase() {
        const {
            MONGO_USER,
            MONGO_PASSWORD,
            MONGO_PATH,
        } = process.env;
        mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);
    }
}

export default App;
