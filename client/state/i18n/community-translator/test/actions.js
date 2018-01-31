/** @format */

/**
 * Internal dependencies
 */
import {
	refreshCommunityTranslator,
	activateCommunityTranslator,
	deactivateCommunityTranslator
} from '../actions';

import {
	I18N_COMMUNITY_TRANSLATOR_ACTIVATE,
	I18N_COMMUNITY_TRANSLATOR_DEACTIVATE,
	I18N_COMMUNITY_TRANSLATOR_REFRESH,
} from 'state/action-types';

describe( 'community translator actions', () => {
	test( '#refreshCommunityTranslator()', () => {
		expect( refreshCommunityTranslator() ).toEqual( {
			type: I18N_COMMUNITY_TRANSLATOR_REFRESH,
		} );
	} );

	test( '#activateCommunityTranslator()', () => {
		expect( activateCommunityTranslator() ).toEqual( {
			type: I18N_COMMUNITY_TRANSLATOR_ACTIVATE,
		} );
	} );

	test( '#deactivateCommunityTranslator()', () => {
		expect( deactivateCommunityTranslator() ).toEqual( {
			type: I18N_COMMUNITY_TRANSLATOR_DEACTIVATE,
		} );
	} );
} );
