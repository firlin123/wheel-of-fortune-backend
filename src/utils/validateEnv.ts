import EnvType from './env.type';
import {
    cleanEnv, port, str, bool, host
} from 'envalid';

function validateEnv(): EnvType {
    let isDev: boolean = process.env.NODE_ENV === 'development';
    let useHttps: boolean = cleanEnv(process.env, {
        USE_HTTPS: bool({ default: false })
    }).USE_HTTPS;

    let opts = {
        JWT_SECRET: str(),
        MONGO_PASSWORD: str(),
        MONGO_PATH: str(),
        MONGO_USER: str(),
        MONGO_SRV: bool({ default: false }),
        PORT: port({ default: 5000 }),
        USE_HTTPS: bool({ default: false }),
        NODE_ENV: str({ choices: ['development', 'production'], default: 'development' }),
    };

    Object.assign(opts, useHttps ? {
        HTTPS_PORT: port({ default: 443 }),
        HTTPS_PRIVATE_KEY_PATH: str(),
        HTTPS_CERTIFICATE_PATH: str(),
        HTTPS_CA_PATH: str(),
    } : {});

    Object.assign(opts, isDev ? {
        DEV_PROXY_HOST: host({ default: 'localhost' }),
        DEV_PROXY_PORT: port({ default: 4200 }),
        DEV_PROXY_SECURE: bool({ default: false }),
    } : {});

    return cleanEnv(process.env, opts) as any as EnvType;
}

export default validateEnv;
