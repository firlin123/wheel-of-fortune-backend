import HttpException from './HttpException';

class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(login: string) {
        super(400, `User with login ${login} already exists`);
    }
}

export default UserWithThatEmailAlreadyExistsException;
