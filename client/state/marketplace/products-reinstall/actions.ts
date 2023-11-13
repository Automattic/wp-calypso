import wpcom from 'calypso/lib/wp';
import {
	MARKETPLACE_PRODUCTS_REINSTALL_COMPLETED,
	MARKETPLACE_PRODUCTS_REINSTALL_FAILED,
	MARKETPLACE_PRODUCTS_REINSTALL_STARTED,
	MARKETPLACE_PRODUCTS_REINSTALL_NOT_STARTED,
} from 'calypso/state/action-types';
import { activateTheme } from 'calypso/state/themes/actions';
import type { AnyAction } from 'redux';
import 'calypso/state/marketplace/init';

/**
 * Reinstall products on a site.
 * @param siteId the site id
 * @returns Promise
 */
export function productsReinstall( siteId: number, themeId: string ) {
	return async ( dispatch: CallableFunction ) => {
		dispatch( productsReinstallStarted( siteId ) );

		try {
			await wpcom.req.get( {
				path: `/sites/${ siteId }/marketplace/products/reinstall`,
				apiNamespace: 'wpcom/v2',
			} );

			dispatch( productsReinstallCompleted( siteId ) );
		} catch ( error ) {
			dispatch( productsReinstallFailed( siteId, ( error as Error ).message ) );
		}
		dispatch( activateTheme( themeId, siteId ) );
	};
}

export function productsReinstallStarted( siteId: number ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_STARTED,
		siteId,
	};
}

export function productsReinstallFailed( siteId: number, error: string ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_FAILED,
		siteId,
		error,
	};
}

export function productsReinstallCompleted( siteId: number ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_COMPLETED,
		siteId,
	};
}

export function productsReinstallNotStarted( siteId: number ): AnyAction {
	return {
		type: MARKETPLACE_PRODUCTS_REINSTALL_NOT_STARTED,
		siteId,
	};
}
