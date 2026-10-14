import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import getPreparedTitanClientContext from '../get-prepared-titan-client-context';

const queryContext = { agencyId: '42', referralId: '99' };
const referral = { id: 99, client: { id: 7, email: 'client@example.com' } };
const originalUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&email=client%40example.com&domain=EXAMPLE.COM&quantity=2&signature=original';
const product = {
	...getEmptyResponseCartProduct(),
	product_id: 3262,
	quantity: 5,
	extra: {
		isA4ASitelessCheckout: true,
		agency_id: 42,
		referral_id: 99,
		titan_domain: 'example.com',
		titan_plan: 'standard',
		afterPurchaseUrl: originalUrl,
	},
};

it.each( [
	[ 3262, 'standard' ],
	[ 3278, 'premium' ],
] )( 'accepts existing Titan product %s and preserves the target quantity', ( productId, plan ) => {
	const products = [
		{
			...product,
			product_id: Number( productId ),
			extra: {
				...product.extra,
				titan_plan: plan,
				afterPurchaseUrl: `${ originalUrl }&plan=${ plan }`,
			},
		},
	];
	expect( getPreparedTitanClientContext( products, queryContext, referral ) ).toEqual( {
		agencyId: 42,
		referralId: 99,
		clientId: 7,
	} );
	expect( products[ 0 ].quantity ).toBe( 5 );
} );

it.each( [
	{ agencyId: '42-cli-7' },
	{ agencyId: '42suffix' },
	{ agencyId: '42\n' },
	{ agencyId: '9007199254740992' },
	{ referralId: '98' },
	{ referralId: '99suffix' },
	{ referralId: undefined },
] )( 'rejects mismatched or malformed query identity %p', ( changes ) => {
	expect(
		getPreparedTitanClientContext( [ product ], { ...queryContext, ...changes }, referral )
	).toBeUndefined();
} );

it.each( [
	{ agency_id: 43 },
	{ referral_id: 98 },
	{ titan_domain: 'other.example.com' },
	{ titan_plan: 'premium' },
	{ afterPurchaseUrl: originalUrl.replace( '42-cli-7', '42-cli-8' ) },
	{ afterPurchaseUrl: originalUrl.replace( '42-cli-7', '42-cli-7suffix' ) },
	{ afterPurchaseUrl: originalUrl.replace( '42-cli-7', '42-cli-7%0A' ) },
	{ afterPurchaseUrl: originalUrl.replace( 'client%40', 'other%40' ) },
	{ afterPurchaseUrl: originalUrl.replace( 'client%40', 'CLIENT%40' ) },
	{ afterPurchaseUrl: originalUrl.replace( 'signature=original', '' ) },
] )(
	'rejects prepared cart context that differs from the referral or signed original %p',
	( extra ) => {
		expect(
			getPreparedTitanClientContext(
				[ { ...product, extra: { ...product.extra, ...extra } } ],
				queryContext,
				referral
			)
		).toBeUndefined();
	}
);

it( 'rejects another product, an empty cart, or multiple items', () => {
	for ( const products of [ [], [ product, product ], [ { ...product, product_id: 1 } ] ] ) {
		expect( getPreparedTitanClientContext( products, queryContext, referral ) ).toBeUndefined();
	}
} );

it( 'rejects a referral for another client', () => {
	expect(
		getPreparedTitanClientContext( [ product ], queryContext, {
			...referral,
			client: { ...referral.client, id: 8 },
		} )
	).toBeUndefined();
} );
