/**
 * Internal dependencies
 */
import { SIGNUP_SEGMENTS_REQUEST, SIGNUP_SEGMENTS_SET } from 'calypso/state/action-types';
import { requestSegments, setSegments } from '../actions';

describe( 'state/signup/segments/actions', () => {
	test( 'requestSegments()', () => {
		expect( requestSegments() ).toEqual( {
			type: SIGNUP_SEGMENTS_REQUEST,
		} );
	} );

	test( 'setSegments()', () => {
		const segments = [ { id: 0 }, { id: 1 } ];

		expect( setSegments( segments ) ).toEqual( {
			type: SIGNUP_SEGMENTS_SET,
			segments,
		} );
	} );
} );
