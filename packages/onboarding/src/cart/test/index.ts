import { Visibility } from '@automattic/data-stores';
import { CartActionConnectionError, CartActionResponseError } from '@automattic/shopping-cart';
import { type Mock, vi } from 'vitest';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import { addProductsToCart, createSite, getNewSiteParams, replaceProductsInCart } from '..';
import { HOSTING_LP_FLOW, ONBOARDING_FLOW } from '../../utils/flows';
import wpcomRequest from '../../wpcom-request';

const mockCartActions = vi.hoisted( () => ( {
	addProductsToCart: vi.fn(),
	replaceProductsInCart: vi.fn(),
	reloadFromServer: vi.fn(),
} ) );
const mockGetCartState = vi.hoisted( () => vi.fn() );

vi.mock( 'calypso/lib/wp', () => ( { default: { req: { post: vi.fn() } } } ) );
vi.mock( '../../wpcom-request', () => ( { default: vi.fn() } ) );
vi.mock( '../create-cart-manager-client', () => ( {
	default: {
		getCartKeyForSiteSlug: vi.fn( async () => 123 ),
		forCartKey: () => ( { actions: mockCartActions, getState: mockGetCartState } ),
	},
} ) );
vi.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => `config:${ key }`;
	config.isEnabled = () => false;
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );

// The account this flow just created is signed in by a bearer token the shared wpcom client
// carries. A bare proxy request has no token and is authenticated by a JWT bound to the browser's
// login cookie instead, which any login, logout or second signup in the browser invalidates. So
// site creation must go through the shared client, as the other site-creation paths do.
describe( 'createSite', () => {
	afterEach( () => vi.clearAllMocks() );

	test( 'posts /sites/new through the shared wpcom client, not the bare proxy', async () => {
		( wpcom.req.post as Mock ).mockResolvedValue( {
			success: true,
			blog_details: { url: 'https://example.wordpress.com', blogid: 123 },
		} );

		const result = await createSite(
			'onboarding',
			'pub/twentytwentyfour',
			Visibility.Private,
			'Example',
			'#113AF5',
			false,
			null,
			'example'
		);

		expect( wpcomRequest ).not.toHaveBeenCalled();
		expect( wpcom.req.post ).toHaveBeenCalledWith(
			{ path: '/sites/new', apiVersion: '1.1' },
			{},
			expect.objectContaining( {
				blog_name: 'example',
				client_id: 'config:wpcom_signup_id',
				client_secret: 'config:wpcom_signup_key',
			} )
		);
		expect( result ).toEqual( {
			siteId: 123,
			siteSlug: 'example.wordpress.com',
			domainItem: undefined,
		} );
	} );
} );

describe( 'cart helpers', () => {
	const cartItems = [ { product_slug: 'personal-bundle' } ];
	const cartError = Object.assign( new Error( 'That product cannot be added.' ), {
		code: 'invalid-product',
	} );

	beforeEach( () => {
		mockCartActions.addProductsToCart.mockRejectedValue( cartError );
		mockCartActions.replaceProductsInCart.mockRejectedValue( cartError );
	} );

	afterEach( () => {
		vi.clearAllMocks();
		mockGetCartState.mockReset();
	} );

	// The cart holds every requested item, so only the error type can make the helper reject.
	function cartHoldsRequestedItems() {
		mockGetCartState.mockReturnValue( {
			responseCart: { products: [ { product_slug: 'personal-bundle', meta: '' } ] },
		} );
	}

	test( 'addProductsToCart rejects with an error that is not a cart action error, even when the cart holds every requested item', async () => {
		cartHoldsRequestedItems();

		await expect(
			addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
		).rejects.toBe( cartError );
	} );

	test( 'addProductsToCart resolves when the cart rejects and no options are passed', async () => {
		await expect(
			addProductsToCart( 'example.wordpress.com', 'domain', cartItems )
		).resolves.toBeUndefined();
		expect( mockCartActions.addProductsToCart ).toHaveBeenCalled();
	} );

	test( 'replaceProductsInCart rejects with an error that is not a cart action error, even when the cart holds every requested item', async () => {
		cartHoldsRequestedItems();

		await expect(
			replaceProductsInCart( 'example.wordpress.com', cartItems, { throwOnError: true } )
		).rejects.toBe( cartError );
	} );

	test( 'replaceProductsInCart resolves when the cart rejects and no options are passed', async () => {
		await expect(
			replaceProductsInCart( 'example.wordpress.com', cartItems )
		).resolves.toBeUndefined();
		expect( mockCartActions.replaceProductsInCart ).toHaveBeenCalled();
	} );

	describe( 'with a cart response error', () => {
		const responseError = new CartActionResponseError(
			'A stale product cannot be purchased.',
			'invalid-product'
		);
		const domainItem = { product_slug: 'dotcom_domain', meta: 'example.com' };

		function cartHolds( products: Array< { product_slug: string; meta: string } > ) {
			mockGetCartState.mockReturnValue( { responseCart: { products } } );
		}

		beforeEach( () => {
			mockCartActions.addProductsToCart.mockRejectedValue( responseError );
			mockCartActions.replaceProductsInCart.mockRejectedValue( responseError );
		} );

		// clearAllMocks keeps a mocked return value, so the cart of one test would stay for the next.
		afterEach( () => {
			mockGetCartState.mockReset();
		} );

		test( 'addProductsToCart resolves when the cart holds every requested item', async () => {
			cartHolds( [
				{ product_slug: 'personal-bundle', meta: '' },
				{ product_slug: 'dotcom_domain', meta: 'example.com' },
			] );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', [ ...cartItems, domainItem ], {
					throwOnError: true,
				} )
			).resolves.toBeUndefined();
		} );

		test( 'addProductsToCart rejects when a requested item is missing from the cart', async () => {
			cartHolds( [ { product_slug: 'personal-bundle', meta: '' } ] );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', [ ...cartItems, domainItem ], {
					throwOnError: true,
				} )
			).rejects.toBe( responseError );
		} );

		test( 'addProductsToCart rejects when the cart holds the slug with a different meta', async () => {
			cartHolds( [ { product_slug: 'dotcom_domain', meta: 'other.com' } ] );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', [ domainItem ], {
					throwOnError: true,
				} )
			).rejects.toBe( responseError );
		} );

		test( 'addProductsToCart resolves when the cart holds the meta in another letter case', async () => {
			cartHolds( [ { product_slug: 'domain_map', meta: 'example.com' } ] );

			await expect(
				addProductsToCart(
					'example.wordpress.com',
					'domain',
					[ { product_slug: 'domain_map', meta: 'Example.com' } ],
					{ throwOnError: true }
				)
			).resolves.toBeUndefined();
		} );

		test( 'addProductsToCart rejects when the cart state cannot be read', async () => {
			mockGetCartState.mockReturnValue( undefined );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
			).rejects.toBe( responseError );
		} );

		test( 'replaceProductsInCart resolves when the cart holds every requested item', async () => {
			cartHolds( [ { product_slug: 'personal-bundle', meta: '' } ] );

			await expect(
				replaceProductsInCart( 'example.wordpress.com', cartItems, { throwOnError: true } )
			).resolves.toBeUndefined();
		} );

		test( 'replaceProductsInCart rejects when a requested item is missing from the cart', async () => {
			cartHolds( [] );

			await expect(
				replaceProductsInCart( 'example.wordpress.com', cartItems, { throwOnError: true } )
			).rejects.toBe( responseError );
		} );

		test( 'replaceProductsInCart rejects when the cart also holds an item that was not requested', async () => {
			cartHolds( [
				{ product_slug: 'personal-bundle', meta: '' },
				{ product_slug: 'dotcom_domain', meta: 'other.com' },
			] );

			await expect(
				replaceProductsInCart( 'example.wordpress.com', cartItems, { throwOnError: true } )
			).rejects.toBe( responseError );
		} );

		// The cart manager rejects with the first message, which here is about the stale product.
		test( 'addProductsToCart rejects with the cart message that names the missing domain', async () => {
			mockGetCartState.mockReturnValue( {
				responseCart: {
					products: [ { product_slug: 'personal-bundle', meta: '' } ],
					messages: {
						errors: [
							{ code: 'invalid-product', message: 'A stale product cannot be purchased.' },
							{ code: 'domain-unavailable', message: 'Example.com is no longer available.' },
						],
					},
				},
			} );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', [ ...cartItems, domainItem ], {
					throwOnError: true,
				} )
			).rejects.toMatchObject( {
				code: 'domain-unavailable',
				message: 'Example.com is no longer available.',
			} );
		} );

		test.each( [
			[ 'a longer name before it', 'myexample.com is no longer available.' ],
			[ 'a longer name after it', 'example.com.au is no longer available.' ],
		] )(
			'addProductsToCart does not take a message that names the missing domain inside %s',
			async ( _case, message ) => {
				mockGetCartState.mockReturnValue( {
					responseCart: {
						products: [ { product_slug: 'personal-bundle', meta: '' } ],
						messages: {
							errors: [
								{ code: 'invalid-product', message: 'A stale product cannot be purchased.' },
								{ code: 'domain-unavailable', message },
							],
						},
					},
				} );

				await expect(
					addProductsToCart( 'example.wordpress.com', 'domain', [ ...cartItems, domainItem ], {
						throwOnError: true,
					} )
				).rejects.toBe( responseError );
			}
		);

		test( 'addProductsToCart takes a message that names the missing domain at the end of a sentence', async () => {
			mockGetCartState.mockReturnValue( {
				responseCart: {
					products: [ { product_slug: 'personal-bundle', meta: '' } ],
					messages: {
						errors: [
							{ code: 'invalid-product', message: 'A stale product cannot be purchased.' },
							{ code: 'domain-unavailable', message: 'Cannot register example.com.' },
						],
					},
				},
			} );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', [ ...cartItems, domainItem ], {
					throwOnError: true,
				} )
			).rejects.toMatchObject( {
				code: 'domain-unavailable',
				message: 'Cannot register example.com.',
			} );
		} );
	} );

	describe( 'with a cart connection error', () => {
		const connectionError = new CartActionConnectionError(
			'Network failure.',
			'SET_SERVER_CART_ERROR'
		);

		beforeEach( () => {
			mockCartActions.addProductsToCart.mockRejectedValue( connectionError );
			mockCartActions.replaceProductsInCart.mockRejectedValue( connectionError );
		} );

		// clearAllMocks keeps a mocked implementation, so the reload of one test would stay for the next.
		afterEach( () => {
			mockGetCartState.mockReset();
			mockCartActions.reloadFromServer.mockReset();
		} );

		// The state before the reload is the cart from before the request, which does not hold the
		// requested items. Only the reload makes the state the server cart, so these mocks set the
		// state from inside the reload.
		function serverCartHolds( products: Array< { product_slug: string; meta: string } > ) {
			mockGetCartState.mockReturnValue( { responseCart: { products: [] } } );
			mockCartActions.reloadFromServer.mockImplementation( async () => {
				mockGetCartState.mockReturnValue( { responseCart: { products } } );
			} );
		}

		test( 'addProductsToCart resolves when the server cart holds every requested item', async () => {
			serverCartHolds( [ { product_slug: 'personal-bundle', meta: '' } ] );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
			).resolves.toBeUndefined();
		} );

		test( 'addProductsToCart rejects when the server cart does not hold a requested item', async () => {
			serverCartHolds( [] );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
			).rejects.toBe( connectionError );
		} );

		test( 'addProductsToCart rejects when the cart fetch fails too', async () => {
			mockGetCartState.mockReturnValue( { responseCart: { products: cartItems } } );
			mockCartActions.reloadFromServer.mockRejectedValue(
				new CartActionConnectionError( 'Network failure.', 'GET_SERVER_CART_ERROR' )
			);

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
			).rejects.toBe( connectionError );
		} );

		test( 'addProductsToCart rejects when the cart fetch does not answer in time', async () => {
			vi.useFakeTimers();
			try {
				mockGetCartState.mockReturnValue( { responseCart: { products: cartItems } } );
				mockCartActions.reloadFromServer.mockReturnValue( new Promise( () => {} ) );

				const assertion = expect(
					addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
				).rejects.toBe( connectionError );
				await vi.advanceTimersByTimeAsync( 10000 );
				await assertion;
			} finally {
				vi.useRealTimers();
			}
		} );

		// A fetch that ends in a response error still makes the state the server cart.
		test( 'addProductsToCart resolves when the cart fetch has a response error and the server cart holds every requested item', async () => {
			mockGetCartState.mockReturnValue( { responseCart: { products: [] } } );
			mockCartActions.reloadFromServer.mockImplementation( async () => {
				mockGetCartState.mockReturnValue( {
					responseCart: { products: [ { product_slug: 'personal-bundle', meta: '' } ] },
				} );
				throw new CartActionResponseError(
					'A stale product cannot be purchased.',
					'invalid-product'
				);
			} );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
			).resolves.toBeUndefined();
		} );

		test( 'addProductsToCart rejects with the response error of the cart fetch when a requested item is missing', async () => {
			const reloadError = new CartActionResponseError(
				'A stale product cannot be purchased.',
				'invalid-product'
			);
			mockGetCartState.mockReturnValue( { responseCart: { products: [] } } );
			mockCartActions.reloadFromServer.mockRejectedValue( reloadError );

			await expect(
				addProductsToCart( 'example.wordpress.com', 'domain', cartItems, { throwOnError: true } )
			).rejects.toBe( reloadError );
		} );

		test( 'replaceProductsInCart rejects when the server cart does not hold a requested item', async () => {
			serverCartHolds( [] );

			await expect(
				replaceProductsInCart( 'example.wordpress.com', cartItems, { throwOnError: true } )
			).rejects.toBe( connectionError );
		} );
	} );
} );

describe( 'getNewSiteParams', () => {
	function testParams( partialParams: Partial< Parameters< typeof getNewSiteParams >[ 0 ] > = {} ) {
		return {
			flowToCheck: 'test-flow',
			themeSlugWithRepo: 'pub/test-theme',
			siteTitle: 'test site title',
			siteAccentColor: '#deface',
			useThemeHeadstart: false,
			siteVisibility: Visibility.Private,
			...partialParams,
			partnerBundle: partialParams.partnerBundle ?? null,
		} satisfies Parameters< typeof getNewSiteParams >[ 0 ];
	}

	test( 'siteVisibility set to publicly indexed', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.PublicIndexed,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.PublicIndexed,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 0,
				} ),
			} )
		);
	} );

	test( 'siteVisibility set to public but not indexed', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.PublicNotIndexed,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.PublicNotIndexed,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 1,
				} ),
			} )
		);
	} );

	test( 'siteVisibility set to private', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.Private,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.Private,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 0, // Private sites are not "private" from all traffic
				} ),
			} )
		);
	} );

	test( 'blog_name hint uses the site title when no site URL is present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: undefined,
					siteTitle: 'Testing Inc.',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'Testing Inc.',
				find_available_url: true,
			} )
		);
	} );

	test.each( [ 'test-flow', ONBOARDING_FLOW, HOSTING_LP_FLOW, 'copy-site', 'do-it-for-me' ] )(
		'%s flow sends an empty blog_name when no site URL or title is present',
		( flowToCheck ) => {
			expect(
				getNewSiteParams(
					testParams( {
						flowToCheck,
						siteUrl: undefined,
						siteTitle: '',
					} )
				)
			).toEqual(
				expect.objectContaining( {
					blog_name: '',
					find_available_url: true,
				} )
			);
		}
	);

	test( 'blog_name hint uses the site URL when present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'testing123.wordpress.com',
					siteTitle: 'Testing Inc.',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'testing123',
				find_available_url: false,
			} )
		);
	} );

	test( 'find_available_url is true when siteUrl is a custom domain', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'example.com',
					siteTitle: 'Testing Inc.',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'example.com',
				find_available_url: true,
			} )
		);
	} );

	test( 'find_available_url is false when siteUrl is a free .blog subdomain', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'mysite.tech.blog',
					siteTitle: 'Testing Inc.',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'mysite.tech.blog',
				find_available_url: false,
			} )
		);
	} );
} );
