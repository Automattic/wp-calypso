/**
 * @jest-environment jsdom
 */
import directToCart from '../direct-to-cart';

jest.mock( 'calypso/my-sites/checkout/get-thank-you-page-url', () => ( {
	getAllowedExternalRedirectHosts: () => [ 'allowed.example' ],
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn() } },
} ) );

function setLocation( search: string ): void {
	Object.defineProperty( window, 'location', {
		writable: true,
		value: new URL( `https://wordpress.com/setup/direct-to-cart${ search }` ),
	} );
}

describe( 'direct-to-cart flow — initialize', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	it( 'routes to the shared error step when no plan is provided', async () => {
		setLocation( '' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toEqual( [ 'error' ] );
	} );

	it( 'routes to the shared error step when plan is non-atomic', async () => {
		setLocation( '?plan=personal-bundle' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toEqual( [ 'error' ] );
	} );

	it( 'returns the full step list for a valid atomic-triggering plan', async () => {
		setLocation( '?plan=business-bundle' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toContain( 'create-site' );
		expect( slugs ).toContain( 'processing' );
		expect( slugs ).toContain( 'error' );
	} );

	it( 'accepts ecommerce-bundle-2y', async () => {
		setLocation( '?plan=ecommerce-bundle-2y' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toContain( 'create-site' );
	} );
} );
