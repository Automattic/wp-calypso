import { addProductsToCart } from '..';
import cartManagerClient from '../create-cart-manager-client';

jest.mock( 'calypso/lib/wp', () => ( { req: { post: jest.fn() } } ), { virtual: true } );
jest.mock( '../../wpcom-request', () => jest.fn() );
jest.mock( '../create-cart-manager-client', () => ( {
	__esModule: true,
	default: { getCartKeyForSiteSlug: jest.fn(), forCartKey: jest.fn() },
} ) );

const addToCart = jest.fn();

/**
 * Add `items` to a signup cart and return what reached the shopping cart.
 */
async function addedProducts( ...args: Parameters< typeof addProductsToCart > ) {
	await addProductsToCart( ...args );
	return addToCart.mock.calls[ 0 ][ 0 ];
}

describe( 'addProductsToCart', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( cartManagerClient.getCartKeyForSiteSlug as jest.Mock ).mockResolvedValue( 123 );
		( cartManagerClient.forCartKey as jest.Mock ).mockReturnValue( {
			actions: { addProductsToCart: addToCart },
		} );
	} );

	test( 'records the signup URL source on every product so checkout can attribute the sale', async () => {
		const products = await addedProducts(
			'example.wordpress.com',
			'onboarding',
			[ { product_slug: 'personal-bundle' }, { product_slug: 'domain_reg', meta: 'example.com' } ],
			'liberate-sh'
		);

		expect( products ).toEqual( [
			{
				product_slug: 'personal-bundle',
				extra: { source: 'liberate-sh', context: 'signup', signup_flow: 'onboarding' },
			},
			{
				product_slug: 'domain_reg',
				meta: 'example.com',
				extra: { source: 'liberate-sh', context: 'signup', signup_flow: 'onboarding' },
			},
		] );
	} );

	test( "keeps a product's own source", async () => {
		const [ product ] = await addedProducts(
			'example.wordpress.com',
			'onboarding',
			[ { product_slug: 'personal-bundle', extra: { source: 'plans-grid' } } ],
			'liberate-sh'
		);

		expect( product.extra.source ).toBe( 'plans-grid' );
	} );

	test( 'adds no source when the signup URL has none', async () => {
		const [ product ] = await addedProducts( 'example.wordpress.com', 'onboarding', [
			{ product_slug: 'personal-bundle' },
		] );

		expect( product.extra ).toEqual( { context: 'signup', signup_flow: 'onboarding' } );
	} );
} );
