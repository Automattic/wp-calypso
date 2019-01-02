/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the site vertical', () => {
		const siteVertical = {
			name: 'glücklich',
			slug: 'happy',
		};
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_SITE_VERTICAL_SET,
					...siteVertical,
				}
			)
		).toEqual( siteVertical );
	} );
} );
