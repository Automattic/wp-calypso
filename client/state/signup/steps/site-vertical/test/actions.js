import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'calypso/state/action-types';
import { setSiteVertical } from '../actions';

describe( 'setSiteVertical()', () => {
	test( 'should return the expected action object', () => {
		const siteVertical = {
			isUserInput: false,
			name: 'heureux',
			slug: 'happy',
		};

		expect( setSiteVertical( siteVertical ) ).toEqual( {
			type: SIGNUP_STEPS_SITE_VERTICAL_SET,
			...siteVertical,
		} );
	} );
} );
