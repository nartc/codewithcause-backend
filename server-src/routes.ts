/* tslint:disable */
import { error } from 'util';

import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { UserController } from './controllers/UserController';
import { OrganizationController } from './controllers/OrganizationController';
import * as passport from 'passport';
import { expressAuthentication } from './middleware/security/passport';

const models: TsoaRoute.Models = {
    "UserRole": {
        "enums": ["Admin", "User"],
    },
    "IUserVm": {
        "properties": {
            "username": { "dataType": "string" },
            "password": { "dataType": "string" },
            "createdOn": { "dataType": "datetime" },
            "updatedOn": { "dataType": "datetime" },
            "role": { "ref": "UserRole" },
            "_id": { "dataType": "string" },
        },
    },
    "INewUserParams": {
        "properties": {
            "username": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
    },
    "IOrganizationVm": {
        "properties": {
            "purchase": { "dataType": "boolean" },
            "name": { "dataType": "string" },
            "contactName": { "dataType": "string" },
            "createdOn": { "dataType": "datetime" },
            "updatedOn": { "dataType": "datetime" },
            "phoneNumber": { "dataType": "double" },
            "_id": { "dataType": "string", "required": true },
        },
    },
    "INewOrganizationParams": {
        "properties": {
            "purchase": { "dataType": "boolean", "required": true },
            "name": { "dataType": "string", "required": true },
            "contactName": { "dataType": "string", "required": true },
            "createdOn": { "dataType": "datetime", "required": true },
            "updatedOn": { "dataType": "datetime", "required": true },
            "phoneNumber": { "dataType": "double", "required": true },
        },
    },
};

export function RegisterRoutes(app: any) {
    app.post('/api/users/create',
        function(request: any, response: any, next: any) {
            const args = {
                newUserParams: { "in": "body", "name": "newUserParams", "required": true, "ref": "INewUserParams" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.registerUser.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/api/users/:username',
        function(request: any, response: any, next: any) {
            const args = {
                username: { "in": "path", "name": "username", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.getUserByUsername.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/api/organization/create',
        function(request: any, response: any, next: any) {
            const args = {
                newOrganizationParams: { "in": "body", "name": "newOrganizationParams", "required": true, "ref": "INewOrganizationParams" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = new OrganizationController();


            const promise = controller.registerUser.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });


    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                if (controllerObj instanceof Controller) {
                    const controller = controllerObj as Controller
                    const headers = controller.getHeaders();
                    Object.keys(headers).forEach((name: string) => {
                        response.set(name, headers[name]);
                    });

                    statusCode = controller.getStatus();
                }

                if (data) {
                    response.status(statusCode || 200).json(data);
                } else {
                    response.status(statusCode || 204).end();
                }
            })
            .catch((error: any) => response.status(500).json(error));
    }

    function getValidatedArgs(args: any, request: any): any[] {
        const errorFields: FieldErrors = {};
        const values = Object.keys(args).map(function(key) {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return ValidateParam(args[key], request.query[name], models, name, errorFields);
                case 'path':
                    return ValidateParam(args[key], request.params[name], models, name, errorFields);
                case 'header':
                    return ValidateParam(args[key], request.header(name), models, name, errorFields);
                case 'body':
                    return ValidateParam(args[key], request.body, models, name, errorFields);
                case 'body-prop':
                    return ValidateParam(args[key], request.body[name], models, name, errorFields);
                case 'formData':
                    return ValidateParam(args[key], request.file, models, name, errorFields);
            }
        });

        if (Object.keys(errorFields).length > 0) {
            throw new ValidateError(errorFields, '');
        }
        return values;
    }
}
