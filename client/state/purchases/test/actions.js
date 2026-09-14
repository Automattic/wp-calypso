import {
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASE_REMOVE_COMPLETED,
	PURCHASE_REMOVE_FAILED,
} from 'calypso/state/action-types';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import useNock, { nock as nockInstance } from 'calypso/test-helpers/use-nock';
import {
	clearPurchases,
	fetchSitePurchases,
	fetchUserPurchases,
	removePurchase,
	removePurchaseFromState,
	restorePurchaseToState,
	__resetRecentlyRemovedPurchaseIds,
} from '../actions';

describe( 'actions', () => {
	const purchases = [ { ID: 1 } ];
	const userId = 1337;
	const siteId = 1234;
	const purchaseId = 31337;

	const dispatch = jest.fn();
	const getState = jest.fn();

	getState.mockReturnValue( {
		ui: {
			selectedSiteId: siteId,
		},
	} );

	describe( '#clearPurchases', () => {
		test( 'should dispatch a `PURCHASES_REMOVE` action', () => {
			clearPurchases()( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASES_REMOVE,
			} );
			expect( dispatch ).toHaveBeenCalledWith( requestAdminMenu( siteId ) );
		} );
	} );

	describe( '#fetchSitePurchases', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.2/sites/${ siteId }/purchases` )
				.reply( 200, purchases );
		} );

		test( 'should dispatch fetch/complete actions', () => {
			const promise = fetchSitePurchases( siteId )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASES_SITE_FETCH,
				siteId,
			} );

			return promise.then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: PURCHASES_SITE_FETCH_COMPLETED,
					siteId,
					purchases,
				} );
			} );
		} );
	} );

	describe( '#fetchUserPurchases', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/me/purchases' )
				.reply( 200, purchases );
		} );

		test( 'should dispatch fetch/complete actions', () => {
			const promise = fetchUserPurchases( userId )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASES_USER_FETCH,
			} );

			return promise.then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: PURCHASES_USER_FETCH_COMPLETED,
					userId,
					purchases,
				} );
			} );
		} );
	} );

	describe( '#removePurchase success', () => {
		const response = { purchases };

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/wpcom/v2/purchases/${ purchaseId }/delete` )
				.reply( 200, response );
		} );

		test( 'should dispatch fetch/complete actions', () => {
			return removePurchase( purchaseId, userId )( dispatch, getState ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: PURCHASE_REMOVE_COMPLETED,
					purchases,
					userId,
				} );
				expect( dispatch ).toHaveBeenCalledWith( requestAdminMenu( siteId ) );
			} );
		} );
	} );

	describe( '#removePurchase failure', () => {
		const errorMessage = 'Unable to delete the purchase because of internal error';
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/wpcom/v2/purchases/${ purchaseId }/delete` )
				.reply( 400, {
					error: 'server_error',
					message: errorMessage,
				} );
		} );

		test( 'should dispatch fetch/remove actions', async () => {
			await expect( removePurchase( purchaseId, userId )( dispatch, getState ) ).rejects.toThrow();

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_FAILED,
				error: errorMessage,
			} );
		} );
	} );

	describe( '#removePurchaseFromState', () => {
		beforeEach( () => {
			dispatch.mockClear();
		} );

		test( 'dispatches PURCHASE_REMOVE_COMPLETED with the target purchase stripped', () => {
			const data = [ { ID: 1 }, { ID: 2 }, { ID: 3 } ];
			getState.mockReturnValueOnce( { purchases: { data } } );

			removePurchaseFromState( 2 )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: [ { ID: 1 }, { ID: 3 } ],
			} );
		} );

		test( 'compares IDs as strings so numeric/string mismatches are tolerated', () => {
			const data = [ { ID: '1' }, { ID: 2 } ];
			getState.mockReturnValueOnce( { purchases: { data } } );

			removePurchaseFromState( 1 )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: [ { ID: 2 } ],
			} );
		} );

		test( 'dispatches an empty list when state has not been loaded yet', () => {
			getState.mockReturnValueOnce( { purchases: { data: null } } );

			removePurchaseFromState( 1 )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: [],
			} );
		} );

		test( 'refreshes the admin menu when a site is selected', () => {
			getState.mockReturnValueOnce( {
				purchases: { data: [ { ID: 1 } ] },
				ui: { selectedSiteId: siteId },
			} );

			removePurchaseFromState( 1 )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( requestAdminMenu( siteId ) );
		} );

		test( 'skips the admin menu refresh when no site is selected', () => {
			getState.mockReturnValueOnce( { purchases: { data: [ { ID: 1 } ] } } );

			removePurchaseFromState( 1 )( dispatch, getState );

			const adminMenuCall = dispatch.mock.calls.find(
				( [ action ] ) => action?.type === requestAdminMenu( siteId ).type
			);
			expect( adminMenuCall ).toBeUndefined();
		} );
	} );

	describe( '#removePurchaseFromState (return value)', () => {
		beforeEach( () => {
			dispatch.mockClear();
		} );

		test( 'returns the captured raw purchase that was stripped', () => {
			const target = { ID: 2, product_name: 'Plan' };
			const data = [ { ID: 1 }, target, { ID: 3 } ];
			getState.mockReturnValueOnce( { purchases: { data } } );

			const captured = removePurchaseFromState( 2 )( dispatch, getState );

			expect( captured ).toEqual( target );
		} );

		test( 'returns null when the target ID is not in state', () => {
			getState.mockReturnValueOnce( { purchases: { data: [ { ID: 1 } ] } } );

			const captured = removePurchaseFromState( 999 )( dispatch, getState );

			expect( captured ).toBeNull();
		} );

		test( 'returns null when state has not been loaded yet', () => {
			getState.mockReturnValueOnce( { purchases: { data: null } } );

			const captured = removePurchaseFromState( 1 )( dispatch, getState );

			expect( captured ).toBeNull();
		} );
	} );

	describe( '#restorePurchaseToState', () => {
		beforeEach( () => {
			dispatch.mockClear();
			__resetRecentlyRemovedPurchaseIds();
		} );

		test( 'dispatches PURCHASE_REMOVE_COMPLETED with the purchase re-added when it is missing', () => {
			const restored = { ID: 2, product_name: 'Plan' };
			getState.mockReturnValueOnce( { purchases: { data: [ { ID: 1 } ] } } );

			restorePurchaseToState( restored )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: [ { ID: 1 }, restored ],
			} );
		} );

		test( 'is idempotent when the purchase is already in state', () => {
			const existing = { ID: 2, product_name: 'Plan' };
			getState.mockReturnValueOnce( { purchases: { data: [ { ID: 1 }, existing ] } } );

			restorePurchaseToState( existing )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: [ { ID: 1 }, existing ],
			} );
		} );

		test( 'tolerates an empty purchases data set', () => {
			const restored = { ID: 2 };
			getState.mockReturnValueOnce( { purchases: { data: null } } );

			restorePurchaseToState( restored )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: [ restored ],
			} );
		} );

		test( 'clears the recentlyRemovedPurchaseIds tracker so subsequent fetches keep the purchase', () => {
			const restored = { ID: 2 };
			// Mark as recently removed (the strip path normally does this).
			getState.mockReturnValueOnce( { purchases: { data: [ { ID: 1 }, restored ] } } );
			removePurchaseFromState( 2 )( dispatch, getState );
			dispatch.mockClear();

			getState.mockReturnValueOnce( { purchases: { data: [ { ID: 1 } ] } } );
			restorePurchaseToState( restored )( dispatch, getState );

			// Now simulate a fetch result containing the restored purchase.
			// The fetch path (fetchSitePurchases) filters out IDs in
			// recentlyRemovedPurchaseIds. After restore, the ID should no longer
			// be in that set, so the fetch dispatches the purchase through
			// unfiltered.
			const apiResponse = [ { ID: 1 }, { ID: 2 } ];
			nockInstance( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.2/sites/${ siteId }/purchases` )
				.reply( 200, apiResponse );

			return fetchSitePurchases( siteId )( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: PURCHASES_SITE_FETCH_COMPLETED,
						purchases: apiResponse,
					} )
				);
			} );
		} );
	} );
} );
