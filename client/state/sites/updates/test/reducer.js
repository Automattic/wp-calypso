/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import updatesReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	errors as errorsReducer
} from '../reducer';

/**
 * Action types constantes
 */
import {
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITES_UPDATE,
	SITE_DELETE_RECEIVE,
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Fixture data
 */
import {
	SITE_ID as siteId,
	SITE_RESPONSE_FIRST as siteObject,
	SITE_UPDATES_RESPONSE as siteUpdate,
	ERROR_MESSAGE_RESPONSE as errorMessageResponse
} from './fixture';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( updatesReducer( undefined, {} ) ).to.have.keys( [
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
				type: SITE_RECEIVE,
				site: siteObject
			};

			const expectedState = {
				[ siteObject.ID ]: siteUpdate
			};

			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should index items state when sites are reciveed site ID', () => {
			const newState = undefined;
			const action = {
				type: SITES_RECEIVE,
				sites: [ siteObject ]
			};

			const expectedState = {
				[ siteObject.ID ]: siteUpdate
			};

			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should index items state when sites are reciveed site ID', () => {
			const newState = undefined;
			const action = {
				type: SITES_RECEIVE,
				sites: [ siteObject ]
			};

			const expectedState = {
				[ siteObject.ID ]: siteUpdate
			};

			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should update index items state when sites are reciveed site ID', () => {
			const previouSiteUpdate = {
				plugins: 8,
				themes: 1,
				wordpress: 0,
				translations: 1,
				total: 10,
				wp_version: '4.7.3',
				jp_version: '4.8-alpha'
			};
			const previouState = {
				[ siteObject.ID ]: previouSiteUpdate
			};
			const action = {
				type: SITES_UPDATE,
				sites: [ siteObject ]
			};

			const expectedState = {
				[ siteObject.ID ]: siteUpdate
			};

			deepFreeze( action );

			expect( itemsReducer( previouState, action ) ).to.eql( expectedState );
		} );

		it( 'should delete index items state when sites are deleted site ID', () => {
			const previouSiteUpdate = {
				plugins: 8,
				themes: 1,
				wordpress: 0,
				translations: 1,
				total: 10,
				wp_version: '4.7.3',
				jp_version: '4.8-alpha'
			};
			const previouState = {
				[ siteObject.ID ]: previouSiteUpdate
			};
			const action = {
				type: SITE_DELETE_RECEIVE,
				site: siteObject
			};

			const expectedState = { [ siteObject.ID ]: null };

			deepFreeze( action );

			expect( itemsReducer( previouState, action ) ).to.eql( expectedState );
		} );

		it( 'should index items state when sites are updates are reciveed site ID', () => {
			const newState = undefined;
			const action = {
				type: SITE_UPDATES_RECEIVE,
				siteId: 222,
				updates: siteUpdate
			};

			const expectedState = {
				[ 222 ]: siteUpdate
			};

			deepFreeze( action );

			expect( itemsReducer( newState, action ) ).to.eql( expectedState );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			expect( requestReducer( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index `requesting` state by site ID', () => {
			const newState = undefined;
			const action = {
				type: SITE_UPDATES_REQUEST,
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
				[ siteId ]: true
			};
			const action = {
				type: SITE_UPDATES_REQUEST_SUCCESS,
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
				[ siteId ]: true
			};

			const action = {
				type: SITE_UPDATES_REQUEST_FAILURE,
				error: errorMessageResponse,
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

		it( 'should update `error` state by site ID on FAILURE', () => {
			const newState = {};
			const action = {
				type: SITE_UPDATES_REQUEST_FAILURE,
				error: errorMessageResponse,
				siteId
			};

			const expectedState = {
				[ siteId ]: errorMessageResponse
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).to.eql( expectedState );
		} );

		it( 'should update `error` state by site ID on SUCCESS', () => {
			const newState = {};
			const action = {
				type: SITE_UPDATES_REQUEST_SUCCESS,
				siteId
			};

			const expectedState = {
				[ siteId ]: null
			};

			deepFreeze( newState );
			deepFreeze( action );

			expect( errorsReducer( newState, action ) ).to.eql( expectedState );
		} );
	} );
} );
