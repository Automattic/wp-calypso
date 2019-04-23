/** @format */

/**
 * Internal dependencies
 */
import { showSignupSitePreview } from '../actions';
import { SIGNUP_SITE_PREVIEW_SHOW } from 'state/action-types';

describe( 'showSignupSitePreview()', () => {
	test( 'should return the expected action object', () => {
		expect( showSignupSitePreview() ).toEqual( {
			type: SIGNUP_SITE_PREVIEW_SHOW,
		} );
	} );
} );
