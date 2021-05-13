/**
 * Internal dependencies
 */
import { setSiteVertical } from '../actions';
import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'calypso/state/action-types';

describe( 'setSiteVertical()', () => {
	test( 'should return the expected action object', () => {
		const siteVertical = {
			isUserInput: false,
			name: 'heureux',
			slug: 'happy',
			preview: '<!--gutenberg-besties-forever <p>Fist bump!</p>-->',
		};

		expect( setSiteVertical( siteVertical ) ).toEqual( {
			type: SIGNUP_STEPS_SITE_VERTICAL_SET,
			...siteVertical,
		} );
	} );
} );
