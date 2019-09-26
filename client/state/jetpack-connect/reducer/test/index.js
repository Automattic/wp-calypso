/**
 * Internal dependencies
 */
import reducer from '..';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		const initialState = reducer( undefined, {} );
		expect( initialState ).toMatchSnapshot();
	} );
} );
