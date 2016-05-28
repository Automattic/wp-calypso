/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import domainsReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	errors as errorsReducer
} from '../reducer';

/**
 * Action types constantes
 */
import {
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Actions creators functions
 */
import {
	domainsRequestAction,
	domainsRequestSuccessAction,
	domainsRequestFailureAction
} from '../actions';

/**
 * Fixture data
 */
import {
	SITE_ID_FIRST as siteId,
	SITE_ID_FIRST as firstSiteId,
	SITE_ID_SECOND as secondSiteId,
	SITE_FIRST_DOMAINS as siteDomains,
	DOMAIN_PRIMARY as firstDomain,
	DOMAIN_NOT_PRIMARY as secondDomain,
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
		expect( domainsReducer( undefined, {} ) ).to.have.keys( [
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
			const newState = undefined;
			const action = {
				type: SITE_DOMAINS_RECEIVE,
				siteId,
				domains: siteDomains
			};
			const expectedState = {
				[ siteId ]: siteDomains
			};

			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should override domains for same site', () => {
			const newState = {
				[ siteId ]: [
					firstDomain,
					secondDomain
				]
			};
			const action = {
				type: SITE_DOMAINS_RECEIVE,
				siteId,
				domains: [ secondDomain ]
			};
			const expectedState = {
				[ siteId ]: [ secondDomain ]
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should accumulate domains for different sites', () => {
			const newState = {
				[ firstSiteId ]: [ firstDomain ]
			};
			const action = {
				type: SITE_DOMAINS_RECEIVE,
				siteId: secondSiteId,
				domains: [ secondDomain ]
			};
			const expectedState = {
				[ firstSiteId ]: [ firstDomain ],
				[ secondSiteId ]: [ secondDomain ]
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should persist state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: [ firstDomain ],
				[ secondSiteId ]: [ secondDomain ]
			} );
			expect( itemsReducer( state, { type: 'SERIALIZE' } ) ).to.eql( state );
		} );

		it( 'should load persisted state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: [ firstDomain ],
				[ secondSiteId ]: [ secondDomain ]
			} );
			expect( itemsReducer( state, { type: 'DESERIALIZE' } ) ).to.eql( state );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = deepFreeze( {
				[ 77203074 ]: [ { domain: 1234 } ]
			} );
			expect( itemsReducer( state, { type: 'DESERIALIZE' } ) ).to.eql( {} );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			expect( requestReducer( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index `requesting` state by site ID', () => {
			const newState = undefined;
			const action = {
				type: SITE_DOMAINS_REQUEST,
				siteId
			};
			const expectedState = {
				[ siteId ]: true
			};

			deepFreeze( action );

			expect( requestReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should update `requesting` state by site ID on SUCCESS', () => {
			const newState = {
				2916284: true
			};
			const action = {
				type: SITE_DOMAINS_REQUEST_SUCCESS,
				siteId
			};

			const expectedState = {
				[ siteId ]: false
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( requestReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should update `requesting` state by site ID on FAILURE', () => {
			const newState = {
				2916284: true
			};
			const action = {
				type: SITE_DOMAINS_REQUEST_FAILURE,
				siteId
			};

			const expectedState = {
				[ siteId ]: false
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( requestReducer( newState, action ) ).to.eql( expectedState );
		} );
	} );

	describe( '#errors()', () => {
		it( 'should default to an empty object', () => {
			expect( errorsReducer( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should clean `errors` state by site ID on REQUEST', () => {
			const newState = {
				[ siteId ]: errorMessageResponse
			};
			const action = domainsRequestAction( siteId );
			const expectedState = {
				[ siteId ]: null
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should clean `errors` state by site ID on SUCCESS', () => {
			const newState = {
				[ siteId ]: errorMessageResponse
			};
			const action = domainsRequestSuccessAction( siteId, errorMessageResponse );
			const expectedState = {
				[ siteId ]: null
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should index `errors` state by site ID on FAILURE', () => {
			const newState = undefined;
			const action = domainsRequestFailureAction( siteId, errorMessageResponse );
			const expectedState = {
				[ siteId ]: errorMessageResponse
			};

			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).to.eql( expectedState );
		} );
	} );
} );
