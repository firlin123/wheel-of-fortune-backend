import { CleanedEnvAccessors } from 'envalid';

type BaseEnvType = {
    JWT_SECRET: string;
    MONGO_PASSWORD: string;
    MONGO_PATH: string;
    MONGO_USER: string;
    MONGO_SRV: boolean;
    PORT: number;
}

type UseHttpsEnvType = {
    USE_HTTPS: true;
    HTTPS_PORT: number;
    HTTPS_PRIVATE_KEY_PATH: string;
    HTTPS_CERTIFICATE_PATH: string;
    HTTPS_CA_PATH: string;
}

type NoUseHttpsEnvType = {
    USE_HTTPS: false;
}

type ProdNodeEnvEnvType = {
    NODE_ENV: 'production';
}

type DevNodeEnvEnvType = {
    NODE_ENV: 'development';
    DEV_PROXY_SECURE: boolean;
    DEV_PROXY_HOST: string;
    DEV_PROXY_PORT: string;
}

type CombinedEnvType =
    BaseEnvType &
    (UseHttpsEnvType | NoUseHttpsEnvType) &
    (DevNodeEnvEnvType | ProdNodeEnvEnvType);

type EnvType = Readonly<CombinedEnvType & CleanedEnvAccessors>;

export default EnvType;