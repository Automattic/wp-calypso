/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).toHaveProperty( 'isShowing' );
	} );
} );
