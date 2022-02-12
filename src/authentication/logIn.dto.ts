import { IsString } from 'class-validator';

class LogInDto {
    @IsString()
    public login: string;

    @IsString()
    public password: string;
}

export default LogInDto;
