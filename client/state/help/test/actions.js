/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	HELP_SELECTED_SITE
} from 'state/action-types';
import {
	selectSiteId,
} from '../actions';

describe( 'actions', () => {
	describe( '#selectSiteId()', () => {
		it( 'should return an action object', () => {
			const action = selectSiteId( 1 );

			expect( action ).to.eql( {
				type: HELP_SELECTED_SITE,
				siteId: 1,
			} );
		} );
	} );
} );
