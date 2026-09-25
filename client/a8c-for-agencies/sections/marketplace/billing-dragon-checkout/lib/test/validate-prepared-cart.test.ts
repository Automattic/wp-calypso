import { validatePreparedCart } from '../validate-prepared-cart';

const titan = { product_id: 1234, quantity: 7 };

function cartWith( products: Array< { product_id: number; quantity: number | null } > ) {
	return { products } as never;
}

describe( 'validatePreparedCart', () => {
	it( 'reports an empty cart', () => {
		expect( validatePreparedCart( cartWith( [] ), [ titan ] ) ).toBe( 'empty' );
		expect( validatePreparedCart( cartWith( [] ) ) ).toBe( 'empty' );
	} );

	it( 'accepts any non-empty cart when nothing specific is expected (reload)', () => {
		expect( validatePreparedCart( cartWith( [ { product_id: 99, quantity: null } ] ) ) ).toBeNull();
	} );

	it( 'accepts a cart containing exactly the expected products and quantities', () => {
		expect(
			validatePreparedCart( cartWith( [ { product_id: 1234, quantity: 7 } ] ), [ titan ] )
		).toBeNull();
	} );

	it( 'reports a quantity mismatch', () => {
		expect(
			validatePreparedCart( cartWith( [ { product_id: 1234, quantity: 5 } ] ), [ titan ] )
		).toBe( 'mismatch' );
	} );

	it( 'reports a different product', () => {
		expect(
			validatePreparedCart( cartWith( [ { product_id: 4321, quantity: 7 } ] ), [ titan ] )
		).toBe( 'mismatch' );
	} );

	it( 'reports extra products beyond the expected ones', () => {
		expect(
			validatePreparedCart(
				cartWith( [
					{ product_id: 1234, quantity: 7 },
					{ product_id: 4321, quantity: 1 },
				] ),
				[ titan ]
			)
		).toBe( 'mismatch' );
	} );

	it( 'treats a null cart quantity as 1', () => {
		expect(
			validatePreparedCart( cartWith( [ { product_id: 1234, quantity: null } ] ), [
				{ product_id: 1234, quantity: 1 },
			] )
		).toBeNull();
	} );
} );
