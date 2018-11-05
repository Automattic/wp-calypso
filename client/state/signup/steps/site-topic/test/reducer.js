/** @format */

/**
 * Internal dependencies
 */
import siteTopic from '../reducer';
import { SIGNUP_STEPS_SITE_TOPIC_SET, SIGNUP_COMPLETE_RESET } from 'state/action-types';

describe( 'siteTopic()', () => {
	test( 'should store the site topic field', () => {
		const action = {
			type: SIGNUP_STEPS_SITE_TOPIC_SET,
			siteTopic: 'Profit!',
		};
		expect( siteTopic( undefined, action ) ).toEqual( action.siteTopic );
	} );

	test( 'should default to null', () => {
		expect( siteTopic( undefined, {} ) ).toBeNull();
	} );

	test( 'should reset on receiving completion', () => {
		expect(
			siteTopic( 'old topic', {
				type: SIGNUP_COMPLETE_RESET,
			} )
		).toBeNull();
	} );
} );
