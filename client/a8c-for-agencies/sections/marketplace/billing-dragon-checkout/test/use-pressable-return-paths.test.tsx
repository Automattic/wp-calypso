/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://agencies.localhost:3000"}
 */
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { renderHook } from '@testing-library/react';
import usePressableCheckoutReturn from '../use-pressable-return-paths';

const product = {
	...getEmptyResponseCartProduct(),
	extra: {
		isA4ASitelessCheckout: true,
		agency_id: 42,
		referral_id: 99,
		titan_domain: 'example.com',
		titan_plan: 'standard',
		afterPurchaseUrl:
			'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&signature=original',
	},
};

it( 'retains the original client URL when this checkout reports an error', () => {
	const { result, rerender } = renderHook(
		( { products, ready } ) =>
			usePressableCheckoutReturn( products, 42, true, ready, { referralId: 99, clientId: 7 } ),
		{
			initialProps: { products: [ product ], ready: true },
		}
	);
	rerender( { products: [], ready: false } );
	expect( result.current.originalUrl ).toBe( product.extra.afterPurchaseUrl );
} );

it( 'does not reuse the previous referral context when another checkout is empty', () => {
	const { result, rerender } = renderHook(
		( { products, ready, referralId } ) =>
			usePressableCheckoutReturn( products, 42, true, ready, { referralId, clientId: 7 } ),
		{
			initialProps: { products: [ product ], ready: true, referralId: 99 },
		}
	);
	rerender( { products: [], ready: false, referralId: 98 } );
	expect( result.current ).toEqual( {} );
} );
