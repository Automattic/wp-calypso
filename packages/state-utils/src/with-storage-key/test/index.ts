/**
 * Internal dependencies
 */
import withStorageKey from '..';

describe( 'withStorageKey', () => {
	it( 'should add the storage key to the reducer', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const reducer = ( state: any, action: any ) => state;

		expect( withStorageKey( 'my-favorite-reducer', reducer ).storageKey ).toEqual(
			'my-favorite-reducer'
		);
	} );
} );
