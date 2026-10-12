import { TITAN_MAIL_MONTHLY_SLUG } from '@automattic/calypso-products';
import cartManagerClient from '@automattic/onboarding/src/cart/create-cart-manager-client';
import { resumePurchaseCart } from '../resume-purchase-cart';

jest.mock( '@automattic/onboarding/src/cart/create-cart-manager-client', () => ( {
	getCartKeyForSiteSlug: jest.fn().mockResolvedValue( 123 ),
	forCartKey: jest.fn(),
} ) );

const plan = { product_slug: 'ecommerce-bundle-2y' };
const domain = { product_slug: 'domain_reg', meta: 'new-example.com' };
const replaceProductsInCart = jest.fn();

beforeEach( () => {
	jest.clearAllMocks();
	replaceProductsInCart.mockResolvedValue( {} );
	jest.mocked( cartManagerClient.forCartKey ).mockReturnValue( {
		fetchInitialCart: jest.fn().mockResolvedValue( {
			products: [
				plan,
				{ product_slug: 'domain_reg', meta: 'old-example.com', is_domain_registration: true },
				{ product_slug: 'gapps', meta: 'old-example.com' },
				{ product_slug: TITAN_MAIL_MONTHLY_SLUG, meta: 'old-example.com' },
				{ product_slug: 'gapps', meta: 'example.com' },
			],
		} ),
		actions: { replaceProductsInCart },
	} as unknown as ReturnType< typeof cartManagerClient.forCartKey > );
} );

it( 'keeps email products when their domain is selected again', async () => {
	await resumePurchaseCart( 'example.wordpress.com', plan, [
		{ ...domain, meta: 'old-example.com' },
	] );
	expect( replaceProductsInCart.mock.calls[ 0 ][ 0 ] ).toEqual(
		expect.arrayContaining( [
			expect.objectContaining( { product_slug: 'gapps', meta: 'old-example.com' } ),
			expect.objectContaining( { product_slug: TITAN_MAIL_MONTHLY_SLUG, meta: 'old-example.com' } ),
		] )
	);
} );

it( 'replaces the selected domain while keeping other products and the plan term', async () => {
	await resumePurchaseCart( 'example.wordpress.com', plan, [ domain ] );
	expect( cartManagerClient.getCartKeyForSiteSlug ).toHaveBeenCalledWith( 'example.wordpress.com' );
	expect( replaceProductsInCart ).toHaveBeenCalledWith( [
		expect.objectContaining( { product_slug: 'gapps' } ),
		expect.objectContaining( { product_slug: 'ecommerce-bundle-2y' } ),
		expect.objectContaining( { product_slug: 'domain_reg', meta: 'new-example.com' } ),
	] );
} );

it( 'removes the prior domain when domain selection is skipped', async () => {
	await resumePurchaseCart( 'example.wordpress.com', plan, [] );
	expect( replaceProductsInCart.mock.calls[ 0 ][ 0 ] ).toHaveLength( 2 );
	expect( replaceProductsInCart.mock.calls[ 0 ][ 0 ] ).not.toEqual(
		expect.arrayContaining( [ expect.objectContaining( { product_slug: 'domain_reg' } ) ] )
	);
} );

it( 'propagates cart write failures so processing cannot advance to checkout', async () => {
	replaceProductsInCart.mockRejectedValue( new Error( 'Cart update failed' ) );
	await expect( resumePurchaseCart( 'example.wordpress.com', plan, [] ) ).rejects.toThrow(
		'Cart update failed'
	);
} );

it.each( [ 'ecommerce-bundle-2y', 'business-bundle-monthly' ] )(
	'keeps the plan and billing term saved at checkout: %s',
	async ( product_slug ) => {
		jest.mocked( cartManagerClient.forCartKey ).mockReturnValue( {
			fetchInitialCart: jest.fn().mockResolvedValue( { products: [ { product_slug } ] } ),
			actions: { replaceProductsInCart },
		} as unknown as ReturnType< typeof cartManagerClient.forCartKey > );
		const selectedPlan = await resumePurchaseCart(
			'example.wordpress.com',
			{ product_slug: 'ecommerce-bundle' },
			[ domain ]
		);
		expect( selectedPlan.product_slug ).toBe( product_slug );
		expect( replaceProductsInCart.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.arrayContaining( [ expect.objectContaining( { product_slug } ) ] )
		);
	}
);

it( 'restores the preselected plan after the cart was emptied', async () => {
	jest.mocked( cartManagerClient.forCartKey ).mockReturnValue( {
		fetchInitialCart: jest.fn().mockResolvedValue( { products: [] } ),
		actions: { replaceProductsInCart },
	} as unknown as ReturnType< typeof cartManagerClient.forCartKey > );
	await expect( resumePurchaseCart( 'example.wordpress.com', plan, [] ) ).resolves.toEqual( plan );
	expect( replaceProductsInCart ).toHaveBeenCalledWith( [
		expect.objectContaining( { product_slug: plan.product_slug } ),
	] );
} );
