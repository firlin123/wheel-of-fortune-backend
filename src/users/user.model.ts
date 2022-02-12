import * as mongoose from 'mongoose';
import User from './user.interface';

const userSchema = new mongoose.Schema({
    login: String,
    name: String,
    password: String,
    rolled: Number,
});

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;
