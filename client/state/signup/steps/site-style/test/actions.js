/** @format */

/**
 * Internal dependencies
 */
import { setSiteStyle } from '../actions';
import { SIGNUP_STEPS_SITE_STYLE_SET } from 'state/action-types';

describe( 'setSiteStyle()', () => {
	test( 'should return the expected action object', () => {
		const siteStyle = 'humongous';

		expect( setSiteStyle( siteStyle ) ).toEqual( {
			type: SIGNUP_STEPS_SITE_STYLE_SET,
			siteStyle,
		} );
	} );
} );
