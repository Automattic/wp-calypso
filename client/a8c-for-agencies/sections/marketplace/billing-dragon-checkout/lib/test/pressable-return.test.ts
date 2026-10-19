import { getPressableReturnUrls } from '../pressable-return';

const destination = 'https://my.pressable.com/titan_email/checkout_return';
const successUrl = `${ destination }?agency_id=42&checkout_status=SUCCESS&signature=a%2Bb%2fc%3D`;
const cancelUrl = `${ destination }?agency_id=42&checkout_status=CANCELED&signature=d%2Be%2ff%3D`;
const product = {
	extra: {
		isA4ASitelessCheckout: true,
		agency_id: 42,
		titan_domain: 'example.com',
		titan_plan: 'standard',
		afterPurchaseUrl: successUrl,
		pressableCancelUrl: cancelUrl,
	},
};

it.each( [ 'standard', 'premium' ] )( 'preserves both signed URLs for %s Titan', ( titanPlan ) => {
	const titanProduct = { extra: { ...product.extra, titan_plan: titanPlan } };
	expect( getPressableReturnUrls( [ titanProduct ], 42 ) ).toEqual( { successUrl, cancelUrl } );
} );

it.each( [
	[ 'afterPurchaseUrl', successUrl.replace( 'my.pressable.com', 'my.pressable.com.evil.test' ) ],
	[ 'pressableCancelUrl', cancelUrl.replace( 'https:', 'http:' ) ],
	[ 'pressableCancelUrl', cancelUrl.replace( 'checkout_return', 'another_path' ) ],
	[ 'afterPurchaseUrl', successUrl.replace( 'my.pressable.com', 'user@my.pressable.com' ) ],
	[ 'afterPurchaseUrl', `${ successUrl }#fragment` ],
	[ 'afterPurchaseUrl', cancelUrl ],
	[ 'pressableCancelUrl', successUrl ],
	[ 'pressableCancelUrl', cancelUrl.replace( 'agency_id=42', 'agency_id=43' ) ],
	[ 'afterPurchaseUrl', `${ successUrl }&checkout_status=CANCELED` ],
] )( 'rejects an unsafe or mismatched %s', ( field, value ) => {
	expect(
		getPressableReturnUrls( [ { extra: { ...product.extra, [ field ]: value } } ], 42 )
	).toBeUndefined();
} );

it( 'requires both signed destinations and prepared Titan agency context', () => {
	for ( const extra of [
		{ ...product.extra, pressableCancelUrl: undefined },
		{ ...product.extra, afterPurchaseUrl: `${ destination }?agency_id=42&checkout_status=SUCCESS` },
		{ ...product.extra, isA4ASitelessCheckout: false },
		{ ...product.extra, agency_id: 43 },
		{ ...product.extra, titan_domain: '' },
		{ ...product.extra, titan_plan: 'unsupported' },
	] ) {
		expect( getPressableReturnUrls( [ { extra } ], 42 ) ).toBeUndefined();
	}
	expect( getPressableReturnUrls( [ product, product ], 42 ) ).toBeUndefined();
} );
