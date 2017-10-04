/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_RECEIVE
} from 'state/action-types';
import {
	items as itemsReducer
} from '../reducer';

import {
	credentials as CREDENTIALS_FIXTURE
} from './fixture';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store new credentials in the items object', () => {
			const stateIn = {},
				siteId = 12345678,
				action = {
					type: JETPACK_CREDENTIALS_RECEIVE,
					siteId,
					credentials: CREDENTIALS_FIXTURE[ siteId ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: CREDENTIALS_FIXTURE[ siteId ]
			} );
		} );
	} );
} );
