/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { JETPACK_CONNECT_AUTHORIZE } from 'calypso/state/jetpack-connect/action-types';
import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
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
