import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { existingCardPrefix } from '../hooks/use-create-payment-methods/use-create-existing-cards';
import { getInitiallySelectedPaymentMethodId } from '../lib/get-initially-selected-payment-method-id';

const paymentMethod = ( id: string ) => ( { id } );

// Mirrors production ordering, where the card sits ahead of free-purchase and
// would therefore win "first available method" for a zero-total cart.
const cardThenFree = [ paymentMethod( 'card' ), paymentMethod( 'free-purchase' ) ];

const cart = ( totalCostInteger: number, storedDetailsId?: string ) => ( {
	...getEmptyResponseCart(),
	total_cost_integer: totalCostInteger,
	products: [
		{
			...getEmptyResponseCartProduct(),
			...( storedDetailsId && { stored_details_id: storedDetailsId } ),
		},
	],
} );

describe( 'getInitiallySelectedPaymentMethodId', () => {
	it( 'selects the free method when credits cover the whole cart', () => {
		expect( getInitiallySelectedPaymentMethodId( cart( 0 ), cardThenFree ) ).toBe(
			'free-purchase'
		);
	} );

	it( 'selects no method for a cart that costs money', () => {
		expect( getInitiallySelectedPaymentMethodId( cart( 9600 ), cardThenFree ) ).toBeUndefined();
	} );

	it( 'selects no method when the cart is free but the free method is unavailable', () => {
		expect(
			getInitiallySelectedPaymentMethodId( cart( 0 ), [ paymentMethod( 'card' ) ] )
		).toBeUndefined();
	} );

	it( 'still prefers a stored card for a renewal, even when the total is zero', () => {
		const storedDetailsId = '1234';

		expect(
			getInitiallySelectedPaymentMethodId( cart( 0, storedDetailsId ), [
				paymentMethod( `${ existingCardPrefix }${ storedDetailsId }` ),
				...cardThenFree,
			] )
		).toBe( `${ existingCardPrefix }${ storedDetailsId }` );
	} );

	it( 'falls back to the free method for a zero-total renewal with no matching stored method', () => {
		expect( getInitiallySelectedPaymentMethodId( cart( 0, '1234' ), cardThenFree ) ).toBe(
			'free-purchase'
		);
	} );
} );
