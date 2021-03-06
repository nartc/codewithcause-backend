import {Body, Get, Path, Post, Put, Query, Route, Tags} from 'tsoa';
import {IHarvestRepository} from '../repositories/interfaces/IHarvestRepository';
import {HarvestRepository} from '../repositories/HarvestRepository';
import {Harvest, HarvestVm, IHarvest} from '../models/Harvest';
import {HarvestParams} from '../models/requests/HarvestParams';
import {Entry} from '../models/Entry';
import {IEntryRepository} from '../repositories/interfaces/IEntryRepository';
import {EntryRepository} from '../repositories/EntryRepository';
import {BaseController} from './BaseController';
import {Farm, IFarm} from '../models/Farm';
import {IFarmRepository} from '../repositories/interfaces/IFarmRepository';
import {FarmRepository} from '../repositories/FarmRepository';
import moment = require('moment');

@Route('harvests')
export class HarvestController extends BaseController {
    private readonly _harvestRepository: IHarvestRepository = new HarvestRepository(Harvest);
    private readonly _entryRepository: IEntryRepository = new EntryRepository(Entry);
    private readonly _farmRepository: IFarmRepository = new FarmRepository(Farm);

    /**
     *
     * @param harvestParams
     */
    @Post('create')
    @Tags('Harvest')
    public async registerHarvest(@Body() harvestParams: HarvestParams): Promise<HarvestVm> {

        if (!harvestParams.farmId) {
            throw HarvestController.resolveErrorResponse(null, 'FarmID is REQUIRED');
        }

        const newHarvest: IHarvest = new Harvest();
        newHarvest.farm = await this._farmRepository.getResourceById(harvestParams.farmId);

        if ((harvestParams.entriesIds && harvestParams.entriesIds.length > 0) && harvestParams.harvestId) {
            const existedHarvest: IHarvest = await this._harvestRepository.getResourceById(harvestParams.harvestId);

            const updatedHarvest: IHarvest = new Harvest();
            updatedHarvest._id = existedHarvest._id;
            updatedHarvest.createdOn = existedHarvest.createdOn;
            updatedHarvest.updatedOn = moment().toDate();
            updatedHarvest.farm = existedHarvest.farm;
            updatedHarvest.entries = await this._entryRepository.getResourcesByIds(harvestParams.entriesIds);

            return await this._harvestRepository.update(harvestParams.harvestId, updatedHarvest) as HarvestVm;
        } else {
            return await this._harvestRepository.create(newHarvest) as HarvestVm;
        }
    }

    /**
     *
     * @param {string} username
     * @returns {Promise<HarvestVm[]>}
     */
    @Get('getAll')
    @Tags('Harvest')
    public async getAll(): Promise<HarvestVm[]> {
        return await this._harvestRepository.getAll() as HarvestVm[];
    }

    // @Get('getQuery')
    // @Tags('Harvest')
    // public async getByDate(@Query() date: Date): Promise<HarvestVm[]> {
    //     return await <HarvestVm[]>this._harvestRepository.findByDate(date);
    // }

    @Get('{id}')
    @Tags('Harvest')
    public async getHarvestById(@Path() id: string): Promise<HarvestVm> {
        return await this._harvestRepository.getResourceById(id) as HarvestVm;
    }

    @Put('{id}')
    @Tags('Harvest')
    public async updateFarm(@Path() id: string, @Query() farmId: string): Promise<HarvestVm> {
        const harvest: IHarvest = await this._harvestRepository.getResourceById(id);

        if (!harvest || harvest === null) {
            throw HarvestController.resolveErrorResponse(null, 'Harvest not found');
        }

        const farm: IFarm = await this._farmRepository.getResourceById(farmId);

        if (!farm || farm === null) {
            throw HarvestController.resolveErrorResponse(null, 'Farm not found');
        }

        harvest.farm = farm;
        harvest.updatedOn = moment().toDate();
        return await this._harvestRepository.update(harvest._id, harvest) as HarvestVm;
    }

    @Post('date')
    @Tags('Harvest')
    public async getHarvestsByDateRange(@Body() dateRange: Date[]): Promise<HarvestVm[]> {
        return await this._harvestRepository.getHarvestByDateRange(dateRange);
    }
}
