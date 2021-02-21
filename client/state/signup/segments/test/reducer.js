/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_SEGMENTS_SET } from 'calypso/state/action-types';

describe( 'state/signup/segments/reducer', () => {
	test( 'should default to `null`', () => {
		expect( reducer( undefined, {} ) ).toEqual( null );
	} );

	test( 'should return segments', () => {
		const segments = [ { id: 0 }, { id: 1 } ];

		expect(
			reducer( undefined, {
				type: SIGNUP_SEGMENTS_SET,
				segments,
			} )
		).toEqual( segments );
	} );
} );
