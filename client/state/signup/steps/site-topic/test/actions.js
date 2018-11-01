/** @format */

/**
 * Internal dependencies
 */
import { setSiteTopic } from '../actions';
import { SIGNUP_STEPS_SITE_TOPIC_SET } from 'state/action-types';

describe( 'setSiteTopic()', () => {
	test( 'should return the expected action object', () => {
		const siteTopic = 'Profit!';

		expect( setSiteTopic( siteTopic ) ).toEqual( {
			type: SIGNUP_STEPS_SITE_TOPIC_SET,
			siteTopic,
		} );
	} );
} );
