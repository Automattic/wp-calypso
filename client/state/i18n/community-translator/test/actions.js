/** @format */

/**
 * Internal dependencies
 */
import {
	toggleCommunityTranslator,
} from '../actions';

import {
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION,
} from 'state/action-types';

describe( 'community translator actions', () => {
	describe( '#toggleCommunityTranslator()', () => {
		test( 'should return expected default action object', () => {
			expect( toggleCommunityTranslator() ).toEqual( {
				type: I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION,
				activated: false,
			} );
		} );
		test( 'should return expected action object with argument value', () => {
			expect( toggleCommunityTranslator( true ) ).toEqual( {
				type: I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION,
				activated: true,
			} );
		} );
	});
} );
