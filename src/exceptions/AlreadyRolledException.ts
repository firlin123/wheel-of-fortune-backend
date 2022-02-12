import HttpException from './HttpException';

class AlreadyRolledException extends HttpException {
    constructor() {
        super(400, 'Already rolled');
    }
}

export default AlreadyRolledException;
