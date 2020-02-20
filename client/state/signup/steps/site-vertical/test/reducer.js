/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { JETPACK_CONNECT_AUTHORIZE, SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should return default  state', () => {} );
	test( 'should update the site vertical and merge with state', () => {
		const siteVertical = {
			name: 'glücklich',
			slug: 'happy',
		};
		const state = {
			isUserInput: true,
			name: 'glücklich',
			slug: 'happy',
			preview: '<ho>ho</ho>',
		};
		expect(
			reducer( state, {
				type: SIGNUP_STEPS_SITE_VERTICAL_SET,
				...siteVertical,
			} )
		).toEqual( {
			...state,
			...siteVertical,
		} );
	} );

	test( 'should reset the site vertical when Jetpack authorization starts', () => {
		const state = {
			isUserInput: true,
			name: 'glücklich',
			slug: 'happy',
			preview: '<ho>ho</ho>',
		};
		expect( reducer( state, { type: JETPACK_CONNECT_AUTHORIZE } ) ).toEqual( {} );
	} );
} );
