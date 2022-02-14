import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as ws from 'ws';
import * as fs from 'fs'
import Controller from './interfaces/controller.interface';
import EnvType from './utils/env.type';
import errorMiddleware from './middleware/error.middleware';

class App {
    public app: express.Application;
    public httpServer: http.Server;
    public httpsServer: https.Server;
    private env: EnvType;

    constructor(controllers: Controller[], validatedEnv: EnvType) {
        this.env = validatedEnv;
        this.app = express();
        this.initializeHttp();
        this.initializeHttps();

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
        this.initializeStaticFiles();
    }

    public listen() {
        this.httpServer.listen(this.env.PORT, () => {
            console.log(`HTTP: App listening on the port ${this.env.PORT}`);
        });

        if (this.env.USE_HTTPS) {
            const { HTTPS_PORT } = this.env;
            this.httpsServer.listen(HTTPS_PORT, () => {
                console.log(`HTTPS: App listening on the port ${HTTPS_PORT}`);
            });
        }
    }

    private setupWebSocketsProxy() {
        if (this.env.NODE_ENV === 'development') {
            const {
                DEV_PROXY_SECURE,
                DEV_PROXY_HOST,
                DEV_PROXY_PORT
            } = this.env;
            function setupWsServer(wsServer: ws.Server, secure: boolean): void {
                wsServer.on('connection', (client: ws, req: http.IncomingMessage) => {
                    try {
                        console.log('[Proxy] WebSocket: ' + req.url);
                        let server: ws = new ws.WebSocket(`${DEV_PROXY_SECURE ? 'wss' : 'ws'}://${DEV_PROXY_HOST}:${DEV_PROXY_PORT}${req.url}`, {
                            headers: {
                                'origin': `${secure ? 'https' : 'http'}://${DEV_PROXY_HOST}:${DEV_PROXY_PORT}`
                            }
                        });
                        client.on('message', (data: ws.RawData, isBinary: boolean) => {
                            try {
                                server.send(isBinary ? data : new TextDecoder().decode(data as ArrayBuffer));
                            } catch (e) { }
                        });
                        server.on('message', (data: ws.RawData, isBinary: boolean) => {
                            try {
                                client.send(isBinary ? data : new TextDecoder().decode(data as ArrayBuffer));
                            } catch (e) { }
                        });
                    } catch (ex) { }
                });
            }
            setupWsServer(new ws.Server({ server: this.httpServer }), false);
            if (this.env.USE_HTTPS) {
                setupWsServer(new ws.Server({ server: this.httpsServer }), true);
            }
        }
    }

    private setupFilesProxy() {
        if (this.env.NODE_ENV === 'development') {
            const {
                DEV_PROXY_SECURE,
                DEV_PROXY_HOST,
                DEV_PROXY_PORT
            } = this.env;

            this.app.get('*', (clientReq, clientRes) => {
                try {
                    console.log('[Proxy] File: ' + clientReq.url);
                    clientReq.pipe(
                        (DEV_PROXY_SECURE ? https : http).request({
                            hostname: DEV_PROXY_HOST,
                            port: DEV_PROXY_PORT,
                            path: clientReq.url,
                            method: clientReq.method,
                            headers: clientReq.headers
                        }, (res) => {
                            try {
                                clientRes.writeHead(res.statusCode, res.headers)
                                res.pipe(clientRes, { end: true });
                            } catch (ex) { }
                        }),
                        { end: true }
                    );
                } catch (ex) { }
            });
        }
    }

    private initializeStaticFiles() {
        if (this.env.NODE_ENV === 'development') {
            this.setupFilesProxy();
            this.setupWebSocketsProxy();
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

    private initializeHttp() {
        this.httpServer = http.createServer(this.app);
    }
    
    public initializeHttps() {
        if (this.env.USE_HTTPS) {
            const {
                HTTPS_PRIVATE_KEY_PATH,
                HTTPS_CERTIFICATE_PATH,
                HTTPS_CA_PATH
            } = this.env;
            const privateKey = fs.readFileSync(HTTPS_PRIVATE_KEY_PATH, 'utf8');
            const certificate = fs.readFileSync(HTTPS_CERTIFICATE_PATH, 'utf8');
            const ca = fs.readFileSync(HTTPS_CA_PATH, 'utf8');
            this.httpsServer = https.createServer({
                key: privateKey,
                cert: certificate,
                ca: ca
            }, this.app);
        }
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
            MONGO_SRV,
            MONGO_USER,
            MONGO_PASSWORD,
            MONGO_PATH,
        } = this.env;
        mongoose.connect(`mongodb${MONGO_SRV ? '+srv' : ''}://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);
    }
}

export default App;
