import i18n from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
	PURCHASES_SITE_RESET_STATE,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_FAILED,
	PURCHASE_REMOVE_COMPLETED,
	PURCHASE_REMOVE_FAILED,
} from 'calypso/state/action-types';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import 'calypso/state/purchases/init';

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );
const PURCHASE_REMOVE_ERROR_MESSAGE = i18n.translate( 'There was an error removing the purchase.' );

export const clearPurchases = () => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );

	dispatch( { type: PURCHASES_REMOVE } );
	if ( siteId ) {
		dispatch( requestAdminMenu( siteId ) );
	}
};

/**
 * Strips a single purchase from the Redux store without resetting the
 * hasLoaded flags. Unlike clearPurchases (which dispatches PURCHASES_REMOVE
 * and wipes the store, forcing QueryUserPurchases to refetch), this dispatches
 * PURCHASE_REMOVE_COMPLETED with the current list minus the target purchase —
 * keeping hasLoadedUserPurchasesFromServer / hasLoadedSitePurchasesFromServer
 * at true so no refetch cascade is triggered.
 *
 * Also refreshes the admin menu to match the sibling thunks (clearPurchases,
 * removePurchase): removing a purchase can change which items appear in the
 * site's wp-admin sidebar (e.g. a removed plugin's menu section), so the menu
 * needs to be re-fetched to avoid stale entries until the next navigation.
 *
 * NOTE: temporary bridge for the legacy `client/me/purchases` surface, which
 * still reads purchases from Redux. The dashboard surface uses React Query
 * directly (see `removePurchaseMutation` in
 * `packages/api-queries/src/upgrades.ts`). Once `client/me/purchases/**`
 * migrates to `useQuery`, this helper can be removed.
 */
export const removePurchaseFromState = ( purchaseId ) => ( dispatch, getState ) => {
	const state = getState();
	const currentData = state.purchases.data ?? [];
	const siteId = getSelectedSiteId( state );
	dispatch( {
		type: PURCHASE_REMOVE_COMPLETED,
		purchases: currentData.filter( ( p ) => String( p.ID ) !== String( purchaseId ) ),
	} );
	if ( siteId ) {
		dispatch( requestAdminMenu( siteId ) );
	}
};

export const fetchSitePurchases = ( siteId ) => ( dispatch ) => {
	dispatch( {
		type: PURCHASES_SITE_FETCH,
		siteId,
	} );

	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/purchases`,
			apiVersion: '1.2',
		} )
		.then( ( data ) => {
			dispatch( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: data,
			} );
		} )
		.catch( () => {
			dispatch( {
				type: PURCHASES_SITE_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE,
			} );
		} );
};

export const fetchUserPurchases = ( userId ) => ( dispatch ) => {
	dispatch( {
		type: PURCHASES_USER_FETCH,
	} );

	return wpcom.req
		.get( {
			path: '/me/purchases',
			apiVersion: '1.2',
		} )
		.then( ( data ) => {
			dispatch( {
				type: PURCHASES_USER_FETCH_COMPLETED,
				purchases: data,
				userId,
			} );
		} )
		.catch( () => {
			dispatch( {
				type: PURCHASES_USER_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE,
			} );
		} );
};

export const removePurchase = ( purchaseId, userId ) => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );

	return new Promise( ( resolve, reject ) =>
		wpcom.req
			.post( {
				path: `/purchases/${ purchaseId }/delete`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( data ) => {
				dispatch( {
					type: PURCHASE_REMOVE_COMPLETED,
					purchases: data.purchases,
					userId,
				} );

				if ( siteId ) {
					dispatch( requestAdminMenu( siteId ) );
				}

				resolve( data );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: PURCHASE_REMOVE_FAILED,
					error: error.message || PURCHASE_REMOVE_ERROR_MESSAGE,
				} );

				reject( error );
			} )
	);
};

export const resetSiteState = () => ( dispatch ) =>
	dispatch( { type: PURCHASES_SITE_RESET_STATE } );
