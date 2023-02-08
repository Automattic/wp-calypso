import {
	MARKETPLACE_PRODUCTS_REINSTALL_COMPLETED,
	MARKETPLACE_PRODUCTS_REINSTALL_FAILED,
	MARKETPLACE_PRODUCTS_REINSTALL_STARTED,
} from 'calypso/state/action-types';
import type { AnyAction } from 'redux';
import 'calypso/state/marketplace/init';

export function productsReinstallStarted( siteId: number ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_STARTED,
		siteId,
	};
}

export function productsReinstallFailed( siteId: number ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_FAILED,
		siteId,
	};
}

export function productsReinstallCompleted( siteId: number ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_COMPLETED,
		siteId,
	};
}
