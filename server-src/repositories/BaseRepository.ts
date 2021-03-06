import {IBaseRepository} from './interfaces/IBaseRepository';
import {Model} from 'mongoose';
import {IBaseModel} from '../models/BaseModel';

export class BaseRepository<T extends IBaseModel> implements IBaseRepository<T> {

    private _model: Model<T>;

    constructor(model: Model<T>) {
        this._model = model;
    }

    public async getAll(): Promise<T[]> {
        return await this._model.find().exec();
    }

    public async create(newResource: T): Promise<T> {
        return await this._model.create(newResource);
    }

    public async delete(resourceId: string): Promise<T> {
        return await this._model.findByIdAndRemove(resourceId).exec();
    }

    public async update(resourceId: string, updatedResource: T): Promise<T> {
        return await this._model.findByIdAndUpdate(resourceId, updatedResource, {new: true}).exec();
    }

    public async getResourceById(resourceId: string): Promise<T> {
        return await this._model.findById(resourceId).exec();
    }

    public async getResourcesByIds(resourceIds: string[]): Promise<T[]> {
        return await this._model.find({_id: resourceIds}).exec();
    }
}