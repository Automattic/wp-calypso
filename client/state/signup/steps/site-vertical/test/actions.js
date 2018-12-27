/** @format */

/**
 * Internal dependencies
 */
import { setSiteVertical } from '../actions';
import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';

describe( 'setSiteVertical()', () => {
	test( 'should return the expected action object', () => {
		const siteVertical = {
			name: 'heureux',
			slug: 'happy',
		};

		expect( setSiteVertical( siteVertical ) ).toEqual( {
			type: SIGNUP_STEPS_SITE_VERTICAL_SET,
			...siteVertical,
		} );
	} );
} );
