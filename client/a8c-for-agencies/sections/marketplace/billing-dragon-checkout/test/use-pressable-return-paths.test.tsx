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

it.each( [ { agencyId: 43 }, { referralId: 98 }, { clientId: 8 }, { prepared: false } ] )(
	'does not reuse return context across checkout identities or modes %p',
	( changes ) => {
		const { result, rerender } = renderHook(
			( { products, ready, agencyId, referralId, clientId, prepared } ) =>
				usePressableCheckoutReturn( products, agencyId, prepared, ready, { referralId, clientId } ),
			{
				initialProps: {
					products: [ product ],
					ready: true,
					agencyId: 42,
					referralId: 99,
					clientId: 7,
					prepared: true,
				},
			}
		);
		rerender( {
			products: [],
			ready: false,
			agencyId: 42,
			referralId: 99,
			clientId: 7,
			prepared: true,
			...changes,
		} );
		expect( result.current ).toEqual( {} );
	}
);

it( 'clears retained context when a ready cart no longer matches the signed checkout', () => {
	const { result, rerender } = renderHook(
		( { products, ready } ) =>
			usePressableCheckoutReturn( products, 42, true, ready, { referralId: 99, clientId: 7 } ),
		{ initialProps: { products: [ product ], ready: true } }
	);
	rerender( {
		products: [ { ...product, extra: { ...product.extra, referral_id: 98 } } ],
		ready: true,
	} );
	expect( result.current ).toEqual( {} );
	rerender( { products: [], ready: false } );
	expect( result.current ).toEqual( {} );
} );

it( 'reloads context from a valid saved cart and retains nothing after an empty remount', () => {
	const renderReturn = ( products: ( typeof product )[], ready: boolean ) =>
		renderHook( () =>
			usePressableCheckoutReturn( products, 42, true, ready, { referralId: 99, clientId: 7 } )
		);
	const initial = renderReturn( [ product ], true );
	expect( initial.result.current.originalUrl ).toBe( product.extra.afterPurchaseUrl );
	initial.unmount();
	const reload = renderReturn( [ product ], true );
	expect( reload.result.current.originalUrl ).toBe( product.extra.afterPurchaseUrl );
	expect( reload.result.current.successPath ).toBe(
		'http://agencies.localhost:3000/client/pressable-return?agency_id=42&referral_id=99&receipt_id=:receiptId'
	);
	reload.unmount();
	const emptyReload = renderReturn( [], false );
	expect( emptyReload.result.current ).toEqual( {} );
} );
