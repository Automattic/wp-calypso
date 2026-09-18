import { membershipProductFromApi } from '../index';

describe( 'membershipProductFromApi', () => {
	const product = {
		id: 1,
		currency: 'USD',
		price: '5.00',
	};

	test.each( [ true, false ] )( 'preserves is_read_only=%s', ( isReadOnly ) => {
		expect( membershipProductFromApi( { ...product, is_read_only: isReadOnly } ) ).toMatchObject( {
			is_read_only: isReadOnly,
		} );
	} );

	test( 'treats a missing read-only value as false', () => {
		expect( membershipProductFromApi( product ) ).toMatchObject( {
			is_read_only: false,
		} );
	} );
} );
