import * as express from 'express';
import userModel from './../users/user.model';
import Controller from '../interfaces/controller.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import AlreadyRolledException from '../exceptions/AlreadyRolledException';

class RollController implements Controller {
    public path = '/roll';
    public router = express.Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getRoll);
    }

    private getRoll = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        if (request.user.rolled === -1) {
            let rolled: number = Math.floor(Math.random() * 8);
            await this.user.findByIdAndUpdate(request.user._id, { rolled });
            response.send({ rolled });
        } else {
            next(new AlreadyRolledException());
        }
    }
}

export default RollController;
