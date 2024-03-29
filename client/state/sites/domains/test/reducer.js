import deepFreeze from 'deep-freeze';
import {
	DOMAIN_PRIVACY_ENABLE_SUCCESS,
	DOMAIN_PRIVACY_DISABLE_SUCCESS,
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import {
	domainsRequestAction,
	domainsRequestSuccessAction,
	domainsRequestFailureAction,
} from '../actions';
import domainsReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	errors as errorsReducer,
} from '../reducer';
import {
	SITE_ID_FIRST as siteId,
	SITE_ID_FIRST as firstSiteId,
	SITE_ID_SECOND as secondSiteId,
	SITE_FIRST_DOMAINS as siteDomains,
	DOMAIN_PRIMARY as firstDomain,
	DOMAIN_NOT_PRIMARY as secondDomain,
	ERROR_MESSAGE_RESPONSE as errorMessageResponse,
} from './fixture';

describe( 'reducer', () => {
	beforeAll( () => {
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( domainsReducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'requesting', 'errors', 'updatingPrivacy' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			expect( itemsReducer( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should index items state by site ID', () => {
			const newState = undefined;
			const action = {
				type: SITE_DOMAINS_RECEIVE,
				siteId,
				domains: siteDomains,
			};
			const expectedState = {
				[ siteId ]: siteDomains,
			};

			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should override domains for same site', () => {
			const newState = {
				[ siteId ]: [ firstDomain, secondDomain ],
			};
			const action = {
				type: SITE_DOMAINS_RECEIVE,
				siteId,
				domains: [ secondDomain ],
			};
			const expectedState = {
				[ siteId ]: [ secondDomain ],
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should enable privacy for given site and domain', () => {
			const state = {
				[ siteId ]: [ firstDomain ],
			};
			const action = {
				type: DOMAIN_PRIVACY_ENABLE_SUCCESS,
				siteId,
				domain: firstDomain.domain,
			};
			const expectedDomain = Object.assign( {}, firstDomain, {
				contactInfoDisclosed: false,
				privateDomain: true,
			} );
			const expectedState = {
				[ siteId ]: [ expectedDomain ],
			};

			deepFreeze( state );
			deepFreeze( action );

			expect( itemsReducer( state, action ) ).toEqual( expectedState );
		} );

		test( 'should disable privacy for given site and domain', () => {
			const state = {
				[ siteId ]: [ firstDomain ],
			};
			const action = {
				type: DOMAIN_PRIVACY_DISABLE_SUCCESS,
				siteId,
				domain: firstDomain.domain,
			};
			const expectedDomain = Object.assign( {}, firstDomain, {
				contactInfoDisclosed: false,
				privateDomain: false,
			} );
			const expectedState = {
				[ siteId ]: [ expectedDomain ],
			};

			deepFreeze( state );
			deepFreeze( action );

			expect( itemsReducer( state, action ) ).toEqual( expectedState );
		} );

		test( 'should accumulate domains for different sites', () => {
			const newState = {
				[ firstSiteId ]: [ firstDomain ],
			};
			const action = {
				type: SITE_DOMAINS_RECEIVE,
				siteId: secondSiteId,
				domains: [ secondDomain ],
			};
			const expectedState = {
				[ firstSiteId ]: [ firstDomain ],
				[ secondSiteId ]: [ secondDomain ],
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should persist state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: [ firstDomain ],
				[ secondSiteId ]: [ secondDomain ],
			} );
			expect( serialize( itemsReducer, state ) ).toEqual( state );
		} );

		test( 'should load persisted state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: [ firstDomain ],
				[ secondSiteId ]: [ secondDomain ],
			} );
			expect( deserialize( itemsReducer, state ) ).toEqual( state );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = deepFreeze( {
				[ 77203074 ]: [ { domain: 1234 } ],
			} );
			expect( deserialize( itemsReducer, state ) ).toEqual( {} );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			expect( requestReducer( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should index `requesting` state by site ID', () => {
			const newState = undefined;
			const action = {
				type: SITE_DOMAINS_REQUEST,
				siteId,
			};
			const expectedState = {
				[ siteId ]: true,
			};

			deepFreeze( action );

			expect( requestReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should update `requesting` state by site ID on SUCCESS', () => {
			const newState = {
				2916284: true,
			};
			const action = {
				type: SITE_DOMAINS_REQUEST_SUCCESS,
				siteId,
			};

			const expectedState = {
				[ siteId ]: false,
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( requestReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should update `requesting` state by site ID on FAILURE', () => {
			const newState = {
				2916284: true,
			};
			const action = {
				type: SITE_DOMAINS_REQUEST_FAILURE,
				siteId,
			};

			const expectedState = {
				[ siteId ]: false,
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( requestReducer( newState, action ) ).toEqual( expectedState );
		} );
	} );

	describe( '#errors()', () => {
		test( 'should default to an empty object', () => {
			expect( errorsReducer( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should clean `errors` state by site ID on REQUEST', () => {
			const newState = {
				[ siteId ]: errorMessageResponse,
			};
			const action = domainsRequestAction( siteId );
			const expectedState = {
				[ siteId ]: null,
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should clean `errors` state by site ID on SUCCESS', () => {
			const newState = {
				[ siteId ]: errorMessageResponse,
			};
			const action = domainsRequestSuccessAction( siteId, errorMessageResponse );
			const expectedState = {
				[ siteId ]: null,
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).toEqual( expectedState );
		} );

		test( 'should index `errors` state by site ID on FAILURE', () => {
			const newState = undefined;
			const action = domainsRequestFailureAction( siteId, errorMessageResponse );
			const expectedState = {
				[ siteId ]: errorMessageResponse,
			};

			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).toEqual( expectedState );
		} );
	} );
} );
