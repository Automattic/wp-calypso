import {
	MARKETPLACE_PRODUCTS_REINSTALL_COMPLETED,
	MARKETPLACE_PRODUCTS_REINSTALL_FAILED,
	MARKETPLACE_PRODUCTS_REINSTALL_STARTED,
	MARKETPLACE_PRODUCTS_REINSTALL_NOT_STARTED,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { IReinstallProductsState, IReinstallProductsStatus } from '../types';
import { productsReinstallSchema } from './schema';
import type { AnyAction } from 'redux';

export const defaultState: IReinstallProductsState = {};

const productsReinstall = withSchemaValidation(
	productsReinstallSchema,
	( state = defaultState, action: AnyAction ): IReinstallProductsState => {
		const { type, siteId, error } = action;
		switch ( type ) {
			case MARKETPLACE_PRODUCTS_REINSTALL_STARTED:
				return {
					...state,
					[ siteId ]: {
						status: IReinstallProductsStatus.IN_PROGRESS,
					},
				};
			case MARKETPLACE_PRODUCTS_REINSTALL_COMPLETED:
				return {
					...state,
					[ siteId ]: {
						status: IReinstallProductsStatus.COMPLETED,
					},
				};
			case MARKETPLACE_PRODUCTS_REINSTALL_FAILED:
				return {
					...state,
					[ siteId ]: {
						status: IReinstallProductsStatus.FAILED,
						error,
					},
				};
			case MARKETPLACE_PRODUCTS_REINSTALL_NOT_STARTED:
				return {
					...state,
					[ siteId ]: {
						status: IReinstallProductsStatus.NOT_STARTED,
					},
				};
		}

		return state;
	}
);

export default productsReinstall;
