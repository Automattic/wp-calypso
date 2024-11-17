import {
	screen,
	render,
	waitFor,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import wpcomRequest from 'wpcom-proxy-request';
import { getEmptyResponseCart } from '../src/empty-carts';
import { useShoppingCart } from '../src/index';
import {
	planOne,
	planTwo,
	renewalOne,
	renewalTwo,
	mainCartKey,
	setCart,
} from './utils/mock-cart-api';
import {
	ProductList,
	MockProvider,
	ProductListWithoutHook,
	MockProviderWithDefaultGetterSetter,
} from './utils/mock-components';
import { convertMsToSecs, verifyThatNever, verifyThatTextNeverAppears } from './utils/utils';

const emptyResponseCart = getEmptyResponseCart();

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useShoppingCart', () => {
	const mockGetCart = jest.fn();
	const markUpdateComplete = jest.fn();
	let testRunErrors = [];

	beforeEach( () => {
		mockGetCart.mockReset();
		markUpdateComplete.mockClear();
		( wpcomRequest as jest.Mock ).mockReset();
		jest.restoreAllMocks();
		testRunErrors = [];
	} );

	describe( 'addProductsToCart', () => {
		const TestComponent = ( { products = undefined, cartKey = undefined } ) => {
			const { addProductsToCart } = useShoppingCart( cartKey );
			const onClick = () => {
				addProductsToCart( products )
					.then( () => markUpdateComplete() )
					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList cartKey={ cartKey } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'adds a product to the cart if the cart is empty', async () => {
			render(
				<MockProvider>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			} );
		} );

		it( 'adds a product to the cart if the cart is empty using the default shopping cart endpoint getter/setter', async () => {
			( wpcomRequest as jest.Mock ).mockImplementation( ( args ) => {
				if ( args.path.startsWith( '/me/shopping-cart' ) && args.method !== 'POST' ) {
					return Promise.resolve( {
						...emptyResponseCart,
						products: [ planTwo ],
					} );
				}
				if ( args.path.startsWith( '/me/shopping-cart' ) && args.method === 'POST' ) {
					return setCart(
						args.body.cart_key ?? parseInt( args.path.split( '/' ).slice( -1 )[ 0 ], 10 ),
						args.body
					);
				}
				return Promise.reject( `Unknown endpoint in test ${ args.path }:${ args.method }` );
			} );
			render(
				<MockProviderWithDefaultGetterSetter>
					<TestComponent products={ [ planOne ] } cartKey={ mainCartKey } />
				</MockProviderWithDefaultGetterSetter>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planTwo.product_name );
			} );
		} );

		it( 'allows setting the cart key via the optional argument', async () => {
			const TestComponentWithKey = () => {
				const shoppingCartManager = useShoppingCart( mainCartKey );
				return (
					<div>
						<ProductListWithoutHook
							productsToAddOnClick={ [ planOne ] }
							shoppingCartManager={ shoppingCartManager }
							cart={ shoppingCartManager.responseCart }
						/>
					</div>
				);
			};
			render(
				<MockProvider cartKeyOverride={ 1238798473 }>
					<TestComponentWithKey />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			} );
		} );

		it( 'throws an error if the product is missing a product_slug', async () => {
			render(
				<MockProvider>
					<TestComponent products={ [ { product_id: planOne.product_id } ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /product_slug/ );
			} );
		} );

		it( 'adds a product to the cart if the existing products are not renewals and the new products are also', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planTwo ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planTwo.product_name );
			} );
		} );

		it( 'adds a product to the cart if the existing products are renewals and the new products are also', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ renewalTwo ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ renewalOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( renewalTwo.product_name );
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( renewalOne.product_name );
			} );
		} );

		it( 'replaces the cart if the existing products are not renewals and any of the new products is a renewal', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ renewalTwo ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).not.toHaveTextContent(
					planOne.product_name
				);
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( renewalTwo.product_name );
			} );
		} );

		it( 'replaces the cart if any of the existing products is a renewal and the new products are not', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ renewalTwo ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
				expect( screen.getByTestId( 'product-list' ) ).not.toHaveTextContent(
					renewalTwo.product_name
				);
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'removeProductFromCart', () => {
		const TestComponent = () => {
			const { removeProductFromCart, responseCart } = useShoppingCart( undefined );
			const onClick = () => {
				const uuid = responseCart.products.length ? responseCart.products[ 0 ].uuid : null;
				removeProductFromCart( uuid )
					.then( () => markUpdateComplete() )
					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'removes a product from the cart', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( planOne.product_name ) );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'replaceProductsInCart', () => {
		const TestComponent = ( { products } ) => {
			const { replaceProductsInCart } = useShoppingCart( undefined );
			const onClick = () => {
				replaceProductsInCart( products )
					.then( () => markUpdateComplete() )
					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent products={ [ planTwo ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'replaces all products in the cart', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ planTwo ] } />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( planOne.product_name ) );
			expect( screen.getByText( planTwo.product_name ) ).toBeInTheDocument();
		} );

		it( 'throws an error if a product is missing a product_slug', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ { product_id: planTwo.product_id } ] } />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /product_slug/ );
			} );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent products={ [ planTwo ] } />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'replaceProductInCart', () => {
		const TestComponent = () => {
			const { replaceProductInCart, responseCart } = useShoppingCart( undefined );
			const onClick = () => {
				const uuid = responseCart.products.length ? responseCart.products[ 0 ].uuid : null;
				replaceProductInCart( uuid, { product_id: planTwo.product_id } )
					.then( () => markUpdateComplete() )

					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'updates a product in the cart', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_slug ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( planOne.product_slug ) );
			expect( screen.getByText( planTwo.product_slug ) ).toBeInTheDocument();
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'applyCoupon', () => {
		const TestComponent = () => {
			const { applyCoupon } = useShoppingCart( undefined );
			const onClick = () => {
				applyCoupon( 'ABCD' )
					.then( () => markUpdateComplete() )
					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'adds a coupon to the cart', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.queryByText( 'Coupon: ABCD' ) ).not.toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByText( 'Coupon: ABCD' ) ).toBeInTheDocument();
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'removeCoupon', () => {
		const TestComponent = () => {
			const { removeCoupon } = useShoppingCart( undefined );
			const onClick = () => {
				removeCoupon()
					.then( () => markUpdateComplete() )
					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'removes a coupon from the cart', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
				is_coupon_applied: true,
				coupon: 'ABCD',
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( 'Coupon: ABCD' ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( 'Coupon: ABCD' ) );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
				is_coupon_applied: true,
				coupon: 'ABCD',
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'updateLocation', () => {
		const TestComponent = () => {
			const { updateLocation } = useShoppingCart( undefined );
			const onClick = () => {
				updateLocation( {
					countryCode: 'US',
					postalCode: '10001',
					subdivisionCode: 'NY',
				} )
					.then( () => markUpdateComplete() )

					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing and rejects if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( testRunErrors ).toHaveLength( 1 );
				expect( String( testRunErrors[ 0 ] ) ).toMatch( /cart key/ );
			} );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'adds a location to the cart', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);
			const locationText = 'Location: 10001, US, NY';
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.queryByText( locationText ) ).not.toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( async () => {
				expect( screen.getByText( locationText ) ).toBeInTheDocument();
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'reloadFromServer', () => {
		const TestComponent = () => {
			const { reloadFromServer } = useShoppingCart( undefined );
			const onClick = () => {
				reloadFromServer()
					.then( () => markUpdateComplete() )
					.catch( ( err ) => testRunErrors.push( err ) );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'does nothing if the cart key is undefined', async () => {
			render(
				<MockProvider useUndefinedCartKey>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( screen.getByText( 'No products' ) ).toBeInTheDocument();
		} );

		it( 'reloads the cart from the server', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();

			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planTwo ],
			} );

			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.queryByText( planOne.product_name ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
			} );
			render(
				<MockProvider getCartOverride={ mockGetCart }>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'when refetchOnWindowFocus is disabled', () => {
		it( 'does not trigger a refetch when the window is focused', async () => {
			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planOne ] } );

			render(
				<MockProvider getCartOverride={ mockGetCart } options={ { refetchOnWindowFocus: false } }>
					<ProductList />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planTwo ] } );

			fireEvent( window, new Event( 'focus' ) );

			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			} );
		} );
	} );

	describe( 'when refetchOnWindowFocus is enabled', () => {
		it( 'triggers a refetch when the window is focused', async () => {
			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planOne ] } );

			render(
				<MockProvider getCartOverride={ mockGetCart } options={ { refetchOnWindowFocus: true } }>
					<ProductList />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planTwo ] } );

			fireEvent( window, new Event( 'focus' ) );

			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planTwo.product_name );
			} );
		} );

		it( 'triggers only one refetch when the window is focused and there are multiple consumers', async () => {
			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planOne ] } );

			render(
				<MockProvider getCartOverride={ mockGetCart } options={ { refetchOnWindowFocus: true } }>
					<ProductList />
					<ProductList />
					<ProductList />
					<ProductList />
				</MockProvider>
			);

			await waitFor( () => screen.getAllByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planTwo ] } );

			mockGetCart.mockClear();
			fireEvent( window, new Event( 'focus' ) );

			await verifyThatNever( () => expect( mockGetCart.mock.calls.length ).toBeGreaterThan( 1 ) );
			expect( mockGetCart ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not trigger a refetch when the window is focused and the last fetch was very recent', async () => {
			const recentTime = convertMsToSecs( Date.now() );
			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planOne ],
				cart_generated_at_timestamp: recentTime,
			} );

			render(
				<MockProvider getCartOverride={ mockGetCart } options={ { refetchOnWindowFocus: true } }>
					<ProductList />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( {
				...emptyResponseCart,
				products: [ planTwo ],
				cart_generated_at_timestamp: recentTime,
			} );

			fireEvent( window, new Event( 'focus' ) );

			await verifyThatTextNeverAppears( planTwo.product_name );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			} );
		} );

		it( 'triggers a refetch when the window is focused and the cart key is no-site', async () => {
			mockGetCart.mockResolvedValue( emptyResponseCart );

			render(
				<MockProvider
					getCartOverride={ mockGetCart }
					cartKeyOverride="no-site"
					options={ { refetchOnWindowFocus: true } }
				>
					<ProductList initialProducts={ [ planOne ] } />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planTwo ] } );

			fireEvent( window, new Event( 'focus' ) );

			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planTwo.product_name );
			} );
		} );

		it( 'does not trigger a refetch when the window is focused and the cart key is no-user', async () => {
			mockGetCart.mockResolvedValue( emptyResponseCart );

			render(
				<MockProvider
					getCartOverride={ mockGetCart }
					cartKeyOverride="no-user"
					options={ { refetchOnWindowFocus: true } }
				>
					<ProductList initialProducts={ [ planOne ] } />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planTwo ] } );

			fireEvent( window, new Event( 'focus' ) );

			await verifyThatTextNeverAppears( planTwo.product_name );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			} );
		} );

		it( 'does not trigger a refetch when the window is focused and the network is offline', async () => {
			mockGetCart.mockResolvedValue( emptyResponseCart );

			render(
				<MockProvider getCartOverride={ mockGetCart } options={ { refetchOnWindowFocus: true } }>
					<ProductList initialProducts={ [ planOne ] } />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );

			mockGetCart.mockResolvedValue( { ...emptyResponseCart, products: [ planTwo ] } );

			jest.spyOn( navigator, 'onLine', 'get' ).mockReturnValueOnce( false );
			fireEvent( window, new Event( 'focus' ) );

			await verifyThatTextNeverAppears( planTwo.product_name );
			await waitFor( () => {
				expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			} );
		} );
	} );
} );
