import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import getPreparedTitanClientContext from '../get-prepared-titan-client-context';

const queryContext = { agencyId: '42', referralId: '99' };
const referral = { id: 99, client: { id: 7, email: 'client@example.com' } };
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
	},
};

it( 'identifies a prepared Titan referral without requiring the old incoming return URL', () => {
	expect( getPreparedTitanClientContext( [ product ], queryContext, referral ) ).toEqual( {
		agencyId: 42,
		referralId: 99,
		clientId: 7,
	} );
} );

it( 'rejects a cart for another agency', () => {
	expect(
		getPreparedTitanClientContext(
			[ { ...product, extra: { ...product.extra, agency_id: 43 } } ],
			queryContext,
			referral
		)
	).toBeUndefined();
} );

it( 'rejects a non-Titan cart', () => {
	expect(
		getPreparedTitanClientContext( [ { ...product, product_id: 1 } ], queryContext, referral )
	).toBeUndefined();
} );
