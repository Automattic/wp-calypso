/** @format */

/**
 * Internal dependencies
 */
import { getSignupSitePreviewLastShown } from '../selectors';
const state = {
	signup: {
		sitePreview: {
			lastShown: 12345678,
		},
	},
};

describe( 'getSignupSitePreviewLastShown', () => {
	test( 'should return on null on empty', () => {
		expect( getSignupSitePreviewLastShown() ).toBe( null );
	} );
	test( 'should return on null on null', () => {
		expect( getSignupSitePreviewLastShown( {} ) ).toBe( null );
	} );
	test( 'should return signup.siteMockupShown value', () => {
		expect( getSignupSitePreviewLastShown( state ) ).toBe( 12345678 );
	} );
} );
