/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import vouchersReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	errors as errorsReducer
} from '../reducer';

/**
 * Action types
 */
import {
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Fixture
 */
import {
	SITE_ID_0 as firstSiteId,
	SITE_ID_1 as secondSiteId,
	GOOGLE_CREDITS as googleAdCredits,
	GOOGLE_AD_CREDITS_0 as firstGoogleAdCredits,
	GOOGLE_AD_CREDITS_1 as secondGoogleAdCredits,
	ERROR_MESSAGE_RESPONSE as errorMessageResponse
} from './fixture';

import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	it( 'should export expected reducer keys', () => {
		expect( vouchersReducer( undefined, {} ) ).to.have.keys( [
			'items',
			'requesting',
			'errors'
		] );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			expect( itemsReducer( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index items state by site ID', () => {
			const initialState = undefined;
			const action = {
				type: SITE_VOUCHERS_RECEIVE,
				siteId: firstSiteId,
				vouchers: googleAdCredits
			};
			const newState = itemsReducer( initialState, action );

			const expectedState = {
				[ firstSiteId ]: googleAdCredits
			};

			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should override vouchers for same site', () => {
			const initialState = {
				[ firstSiteId ]: googleAdCredits
			};
			const action = {
				type: SITE_VOUCHERS_RECEIVE,
				siteId: firstSiteId,
				vouchers: firstGoogleAdCredits
			};
			const expectedState = {
				[ firstSiteId ]: firstGoogleAdCredits
			};
			deepFreeze( initialState );
			deepFreeze( action );

			expect( itemsReducer( initialState, action ) ).to.eql( expectedState );
		} );

		it( 'should accumulate vouchers for different sites', () => {
			const initialState = {
				[ firstSiteId ]: firstGoogleAdCredits
			};
			const action = {
				type: SITE_VOUCHERS_RECEIVE,
				siteId: secondSiteId,
				vouchers: secondGoogleAdCredits
			};
			const newState = itemsReducer( initialState, action );

			const expectedState = {
				[ firstSiteId ]: firstGoogleAdCredits,
				[ secondSiteId ]: secondGoogleAdCredits
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should persist state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: firstGoogleAdCredits,
				[ secondSiteId ]: secondGoogleAdCredits
			} );
			expect( itemsReducer( state, { type: 'SERIALIZE' } ) ).to.eql( state );
		} );

		it( 'should load persisted state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: firstGoogleAdCredits,
				[ secondSiteId ]: secondGoogleAdCredits
			} );
			expect( itemsReducer( state, { type: 'DESERIALIZE' } ) ).to.eql( state );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: [ { voucher: 1234567890 } ]
			} );
			expect( itemsReducer( state, { type: 'DESERIALIZE' } ) ).to.eql( {} );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			expect( requestReducer( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index `requesting` state by site ID', () => {
			const initialState = undefined;
			const action = {
				type: SITE_VOUCHERS_REQUEST,
				siteId: firstSiteId
			};
			const newState = requestReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: true
			};

			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should index and accumulate `requesting` state by site ID', () => {
			const initialState = {
				[ firstSiteId ]: false
			};
			const action = {
				type: SITE_VOUCHERS_REQUEST,
				siteId: secondSiteId
			};
			const newState = requestReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: false,
				[ secondSiteId ]: true
			};

			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should update `requesting` state by site ID on SUCCESS', () => {
			const initialState = {
				[ firstSiteId ]: true
			};
			const action = {
				type: SITE_VOUCHERS_REQUEST_SUCCESS,
				siteId: firstSiteId
			};
			const newState = requestReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: false
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should update `requesting` state by site ID on FAILURE', () => {
			const initialState = {
				[ firstSiteId ]: true
			};
			const action = {
				type: SITE_VOUCHERS_REQUEST_FAILURE,
				siteId: firstSiteId
			};
			const newState = requestReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: false
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should accumulate `requesting` state by site ID on FAILURE', () => {
			const initialState = {
				[ firstSiteId ]: false
			};
			const action = {
				type: SITE_VOUCHERS_REQUEST_FAILURE,
				siteId: secondSiteId
			};
			const newState = requestReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: false,
				[ secondSiteId ]: false
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );
	} );

	describe( '#errors()', () => {
		it( 'should default to an empty object', () => {
			expect( errorsReducer( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should clean `errors` state by site ID on REQUEST', () => {
			const initialState = {
				[ firstSiteId ]: errorMessageResponse
			};
			const action = {
				type: SITE_VOUCHERS_REQUEST,
				siteId: firstSiteId
			};
			const newState = errorsReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: null
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should clean `errors` state by site ID on SUCCESS', () => {
			const initialState = {
				[ firstSiteId ]: errorMessageResponse
			};
			const action = {
				type: SITE_VOUCHERS_REQUEST_SUCCESS,
				siteId: firstSiteId
			};
			const newState = errorsReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: null
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should index `errors` state by site ID on FAILURE', () => {
			const initialState = undefined;
			const action = {
				type: SITE_VOUCHERS_REQUEST_FAILURE,
				siteId: firstSiteId,
				error: errorMessageResponse
			};
			const newState = errorsReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: errorMessageResponse
			};

			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );
	} );
} );
