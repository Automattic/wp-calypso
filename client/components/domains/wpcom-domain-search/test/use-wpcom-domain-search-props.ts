/**
 * @jest-environment jsdom
 */

import {
	getEmptyResponseCartProduct,
	ResponseCart,
	ResponseCartProduct,
	UseShoppingCart,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { renderHookWithProvider } from '../../../../test-helpers/testing-library';
import {
	recordDomainSearchStepSubmit,
	recordUseYourDomainButtonClick,
	recordSearchFormSubmitButtonClick,
} from '../analytics';
import { getCartKey, useWPCOMDomainSearchProps } from '../use-wpcom-domain-search-props';

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );

jest.mock( '../analytics', () => ( {
	...jest.requireActual( '../analytics' ),
	recordDomainSearchStepSubmit: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
	recordUseYourDomainButtonClick: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
	recordSearchFormSubmitButtonClick: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
} ) );

const mockUseShoppingCart = useShoppingCart as jest.MockedFunction< typeof useShoppingCart >;

const buildShoppingCart = ( {
	responseCart,
	...overrides
}: Partial<
	Omit< UseShoppingCart, 'responseCart' > & { responseCart: Partial< ResponseCart > }
> = {} ): UseShoppingCart => ( {
	addProductsToCart: jest.fn(),
	removeProductFromCart: jest.fn(),
	applyCoupon: jest.fn(),
	removeCoupon: jest.fn(),
	updateLocation: jest.fn(),
	replaceProductInCart: jest.fn(),
	replaceProductsInCart: jest.fn(),
	reloadFromServer: jest.fn(),
	clearMessages: jest.fn(),
	isLoading: false,
	loadingError: undefined,
	loadingErrorType: undefined,
	isPendingUpdate: false,
	couponStatus: 'fresh',
	...overrides,
	responseCart: {
		products: [],
		sub_total_with_taxes_integer: 0,
		cart_key: 1,
		total_tax: '2',
		coupon_savings_total_integer: 2,
		next_domain_is_free: false,
		next_domain_condition: '',
		blog_id: 1,
		total_tax_integer: 0,
		total_tax_breakdown: [],
		total_cost: 0,
		total_cost_integer: 0,
		sub_total_integer: 0,
		credits_integer: 0,
		gift_details: undefined,
		is_gift_purchase: false,
		currency: 'USD',
		allowed_payment_methods: [],
		coupon: '',
		is_coupon_applied: false,
		has_auto_renew_coupon_been_automatically_applied: false,
		locale: 'en',
		is_signup: false,
		messages: undefined,
		cart_generated_at_timestamp: 0,
		tax: {
			display_taxes: false,
			location: {},
		},
		...responseCart,
	},
} );

const buildProduct = ( overrides: Partial< ResponseCartProduct > = {} ): ResponseCartProduct => ( {
	...getEmptyResponseCartProduct(),
	...overrides,
} );

const defaultProps = {
	flowName: 'flow-name',
	flowAllowsMultipleDomainsInCart: true,
	analyticsSection: 'analytics-section',
	events: {
		onContinue: jest.fn(),
	},
};

describe( 'useWPCOMDomainSearchProps', () => {
	beforeEach( () => {
		mockUseShoppingCart.mockReturnValue( buildShoppingCart() );
	} );

	it( 'returns the expected structure for the items in the domain search cart', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							uuid: 'dotcom',
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
							meta: 'my-domain.com',
							item_subtotal_integer: 5000,
						} ),
					],
				},
			} )
		);

		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

		expect( result.current.cart.items ).toEqual( [
			{
				uuid: 'dotcom',
				domain: 'my-domain',
				tld: 'com',
				price: '$50',
				salePrice: undefined,
			},
		] );
	} );

	describe( 'domain ordering', () => {
		it( 'puts the bundled domain at the top', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						bundled_domain: 'my-domain.com',
						products: [
							buildProduct( {
								uuid: 'dotcom2',
								product_slug: 'dotcom_domain',
								is_domain_registration: true,
								meta: 'my-domain2.com',
								item_subtotal_integer: 50_00,
							} ),
							buildProduct( {
								uuid: 'dotcom',
								product_slug: 'dotcom_domain',
								is_domain_registration: true,
								meta: 'my-domain.com',
								item_subtotal_integer: 10_00,
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

			expect( result.current.cart.items ).toEqual( [
				expect.objectContaining( { uuid: 'dotcom' } ),
				expect.objectContaining( { uuid: 'dotcom2' } ),
			] );
		} );

		it( 'puts the most expensive domain at the top', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								meta: 'my-domain.com',
								item_subtotal_integer: 5_000,
								is_domain_registration: true,
							} ),
							buildProduct( {
								uuid: 'dotcom2',
								meta: 'my-domain2.com',
								item_subtotal_integer: 100_00,
								is_domain_registration: true,
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

			expect( result.current.cart.items ).toEqual( [
				expect.objectContaining( { uuid: 'dotcom2' } ),
				expect.objectContaining( { uuid: 'dotcom' } ),
			] );
		} );
	} );

	describe( 'free domain for the first year', () => {
		describe( 'config.priceRules.freeForFirstYear', () => {
			it( 'returns true if there are no items in the cart, isFreeForFirstYear is true, and there is no plan in the cart', () => {
				mockUseShoppingCart.mockReturnValue(
					buildShoppingCart( {
						responseCart: {
							products: [],
						},
					} )
				);

				const { result } = renderHookWithProvider( () =>
					useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
				);

				expect( result.current.config.priceRules.freeForFirstYear ).toBe( true );
			} );

			it( 'defers to the cart flag coming from the server if there is a plan in the cart', () => {
				mockUseShoppingCart.mockReturnValue(
					buildShoppingCart( {
						responseCart: {
							next_domain_is_free: false,
							products: [ buildProduct( { product_slug: 'business-bundle' } ) ],
						},
					} )
				);

				const { result } = renderHookWithProvider( () =>
					useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
				);

				expect( result.current.config.priceRules.freeForFirstYear ).toBe( false );
			} );
		} );

		it( 'renders the first domain as free if config.priceRules.freeForFirstYear is true', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								product_slug: 'dotcom_domain',
								meta: 'my-domain.com',
								is_domain_registration: true,
								item_original_cost_integer: 17100,
								item_original_subtotal_integer: 17100,
								item_subtotal_integer: 17100,
							} ),
							buildProduct( {
								uuid: 'dotcom2',
								product_slug: 'dotcomdotbr_domain',
								meta: 'myfefe.com.br',
								is_domain_registration: true,
								item_original_cost_integer: 9900,
								item_original_subtotal_integer: 9900,
								item_subtotal_integer: 9900,
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () =>
				useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
			);

			expect( result.current.cart.items ).toEqual( [
				expect.objectContaining( { uuid: 'dotcom', salePrice: '$0', price: '$171' } ),
				expect.objectContaining( { uuid: 'dotcom2', salePrice: undefined, price: '$99' } ),
			] );
		} );

		it( 'does not render any domain as free if there are only premium domains in the cart and config.priceRules.freeForFirstYear is true', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								product_slug: 'dotcom_domain',
								meta: 'my-premium-domain.com',
								is_domain_registration: true,
								item_original_cost_integer: 1000_00,
								item_original_subtotal_integer: 1000_00,
								item_subtotal_integer: 1000_00,
								extra: {
									premium: true,
								},
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () =>
				useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
			);

			expect( result.current.cart.items ).toEqual( [
				expect.objectContaining( { uuid: 'dotcom', salePrice: undefined, price: '$1,000' } ),
			] );
		} );

		it( 'renders the first non-premium domain as free if config.priceRules.freeForFirstYear is true and there is a premium domain in the cart', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								product_slug: 'dotcom_domain',
								meta: 'my-premium-domain.com',
								is_domain_registration: true,
								item_original_cost_integer: 1000_00,
								item_original_subtotal_integer: 1000_00,
								item_subtotal_integer: 1000_00,
								extra: {
									premium: true,
								},
							} ),
							buildProduct( {
								uuid: 'dotcom2',
								product_slug: 'dotcom_domain',
								meta: 'my-regular-domain.com',
								is_domain_registration: true,
								item_original_cost_integer: 10_00,
								item_original_subtotal_integer: 10_00,
								item_subtotal_integer: 10_00,
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () =>
				useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
			);

			expect( result.current.cart.items ).toEqual( [
				expect.objectContaining( { uuid: 'dotcom', salePrice: undefined, price: '$1,000' } ),
				expect.objectContaining( { uuid: 'dotcom2', salePrice: '$0', price: '$10' } ),
			] );
		} );

		it( 'renders the first non-premium domain as free if config.priceRules.freeForFirstYear is true and there is more than one premium domain in the cart', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								product_slug: 'dotcom_domain',
								meta: 'my-premium-domain.com',
								is_domain_registration: true,
								item_original_cost_integer: 1000_00,
								item_original_subtotal_integer: 1000_00,
								item_subtotal_integer: 1000_00,
								extra: {
									premium: true,
								},
							} ),
							buildProduct( {
								uuid: 'dotcom2',
								product_slug: 'dotcom_domain',
								meta: 'my-premium-domain2.com',
								is_domain_registration: true,
								item_original_cost_integer: 5_00,
								item_original_subtotal_integer: 5_00,
								item_subtotal_integer: 5_00,
								extra: {
									premium: true,
								},
							} ),
							buildProduct( {
								uuid: 'dotcom3',
								product_slug: 'dotcom_domain',
								meta: 'my-regular-domain.com',
								is_domain_registration: true,
								item_original_cost_integer: 10_00,
								item_original_subtotal_integer: 10_00,
								item_subtotal_integer: 10_00,
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () =>
				useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
			);

			expect( result.current.cart.items ).toEqual( [
				expect.objectContaining( { uuid: 'dotcom', salePrice: undefined, price: '$1,000' } ),
				expect.objectContaining( { uuid: 'dotcom3', salePrice: '$0', price: '$10' } ),
				expect.objectContaining( { uuid: 'dotcom2', salePrice: undefined, price: '$5' } ),
			] );
		} );
	} );

	describe( 'total price', () => {
		it( 'returns the total price for the cart', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								item_subtotal_integer: 50_00,
								item_original_cost_integer: 100_00,
								is_domain_registration: true,
								meta: 'my-domain.com',
								product_slug: 'dotcom_domain',
							} ),
							buildProduct( {
								uuid: 'dotcom2',
								item_subtotal_integer: 10_00,
								item_original_cost_integer: 20_00,
								is_domain_registration: true,
								meta: 'my-domain2.com',
								product_slug: 'dotcom_domain',
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

			expect( result.current.cart.total ).toEqual( '$60' );
		} );

		it( 'returns the total price for the cart with the first non-premium domain free if config.priceRules.freeForFirstYear is true', () => {
			mockUseShoppingCart.mockReturnValue(
				buildShoppingCart( {
					responseCart: {
						products: [
							buildProduct( {
								uuid: 'dotcom',
								item_subtotal_integer: 1000_00,
								item_original_cost_integer: 1000_00,
								is_domain_registration: true,
								meta: 'my-premium-domain.com',
								product_slug: 'dotcom_domain',
								extra: {
									premium: true,
								},
							} ),
							buildProduct( {
								uuid: 'dotcom2',
								item_subtotal_integer: 50_00,
								item_original_cost_integer: 50_00,
								is_domain_registration: true,
								meta: 'my-premium-domain2.com',
								product_slug: 'dotcom_domain',
								extra: {
									premium: true,
								},
							} ),
							buildProduct( {
								uuid: 'dotcom3',
								item_subtotal_integer: 10_00,
								item_original_cost_integer: 20_00,
								is_domain_registration: true,
								meta: 'my-regular-domain3.com',
								product_slug: 'dotcom_domain',
							} ),
						],
					},
				} )
			);

			const { result } = renderHookWithProvider( () =>
				useWPCOMDomainSearchProps( { ...defaultProps, isFirstDomainFreeForFirstYear: true } )
			);

			expect( result.current.cart.total ).toEqual( '$1,050' );
		} );
	} );

	it( 'returns the promotional price if there is one', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							uuid: 'dotcom',
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
							meta: 'my-domain.com',
							item_original_cost_integer: 3000,
							item_subtotal_integer: 2500,
							cost_overrides: [
								{
									does_override_original_cost: false,
									human_readable_reason: 'Sale_Coupon->apply_sale_discount',
									new_subtotal_integer: 25,
									old_subtotal_integer: 30,
									override_code: 'sale_coupon',
									percentage: 0,
									first_unit_only: false,
								},
							],
						} ),
					],
				},
			} )
		);

		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

		expect( result.current.cart.items ).toEqual( [
			{
				uuid: 'dotcom',
				domain: 'my-domain',
				tld: 'com',
				price: '$30',
				salePrice: '$25',
			},
		] );
	} );

	it( 'returns only domain mappings, registrations, transfers and internal moves in the cart', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
							meta: 'my-domain.com',
							uuid: 'dotcom',
						} ),
						buildProduct( {
							product_slug: 'domain_map',
							meta: 'external-map.com',
							uuid: 'mapping',
						} ),
						buildProduct( {
							product_slug: 'domain_transfer',
							meta: 'transfer.com',
							uuid: 'transfer',
						} ),
						buildProduct( {
							product_slug: 'domain_move_internal',
							meta: 'internal-move.com',
							uuid: 'move',
						} ),
						buildProduct( {
							product_slug: 'value_bundle',
							uuid: 'plan',
						} ),
					],
				},
			} )
		);

		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

		expect( result.current.cart.items ).toEqual( [
			expect.objectContaining( { uuid: 'dotcom' } ),
			expect.objectContaining( { uuid: 'mapping' } ),
			expect.objectContaining( { uuid: 'transfer' } ),
			expect.objectContaining( { uuid: 'move' } ),
		] );
	} );

	it( 'finds items in the cart', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							uuid: 'dotcom',
							meta: 'my-domain.com',
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
						} ),
					],
				},
			} )
		);

		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchProps( defaultProps ) );

		expect( result.current.cart.hasItem( 'my-domain.com' ) ).toBe( true );
		expect( result.current.cart.hasItem( 'external-map.com' ) ).toBe( false );
	} );

	it( 'returns no items from the cart if flowAllowsMultipleDomainsInCart is false', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
							meta: 'my-domain.com',
						} ),
					],
				},
			} )
		);

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				flowAllowsMultipleDomainsInCart: false,
			} )
		);

		expect( result.current.cart.items ).toEqual( [] );
	} );

	it( 'calls beforeAddDomainToCart so it is possible to modify the domain before it is added to the cart', () => {
		const beforeAddDomainToCart = jest.fn().mockImplementation( ( domain ) => domain );

		mockUseShoppingCart.mockReturnValue( buildShoppingCart() );

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				events: {
					...defaultProps.events,
					beforeAddDomainToCart,
				},
			} )
		);

		result.current.cart.onAddItem( {
			domain_name: 'my-domain.com',
			product_slug: 'domain',
			supports_privacy: true,
		} );

		expect( beforeAddDomainToCart ).toHaveBeenCalledWith( {
			meta: 'my-domain.com',
			product_slug: 'domain',
			extra: {
				flow_name: 'flow-name',
				privacy: true,
				privacy_available: true,
			},
		} );
	} );

	describe( 'cart key', () => {
		it( 'returns the site id if provided', () => {
			expect( getCartKey( { isLoggedIn: false, currentSiteId: 123 } ) ).toBe( 123 );
		} );

		it( 'returns the no-site cart key if the user is logged in and no site id is provided', () => {
			expect( getCartKey( { isLoggedIn: true, currentSiteId: undefined } ) ).toBe( 'no-site' );
		} );

		it( 'returns the no-user cart key if the user is not logged in and no site id is provided', () => {
			expect( getCartKey( { isLoggedIn: false, currentSiteId: undefined } ) ).toBe( 'no-user' );
		} );
	} );

	it( 'calls the step submission tracking when onContinue is invoked', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							meta: 'my-domain.com',
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
						} ),
					],
				},
			} )
		);

		const onContinue = jest.fn();
		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				events: { ...defaultProps.events, onContinue },
			} )
		);

		result.current.events.onContinue();

		expect( recordDomainSearchStepSubmit ).toHaveBeenCalledWith(
			{ domain_name: 'my-domain.com' },
			'analytics-section'
		);
	} );

	it( 'calls onContinue with the domain items when events.onContinue is invoked', () => {
		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				responseCart: {
					products: [
						buildProduct( {
							product_slug: 'dotcom_domain',
							is_domain_registration: true,
							meta: 'my-domain.com',
						} ),
					],
				},
			} )
		);

		const onContinue = jest.fn();

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				events: { ...defaultProps.events, onContinue },
			} )
		);

		result.current.events.onContinue();

		expect( onContinue ).toHaveBeenCalledWith( [
			expect.objectContaining( { meta: 'my-domain.com', product_slug: 'dotcom_domain' } ),
		] );
	} );

	it( 'calls onContinue after selecting a domain if flowAllowsMultipleDomainsInCart is false', async () => {
		const addProductsToCart = jest.fn().mockReturnValue( {
			products: [
				{
					meta: 'my-domain.com',
					product_slug: 'domain',
					supports_privacy: false,
				},
			],
		} );

		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				addProductsToCart,
			} )
		);

		const onContinue = jest.fn();

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				flowAllowsMultipleDomainsInCart: false,
				events: {
					...defaultProps.events,
					onContinue,
				},
			} )
		);

		await result.current.cart.onAddItem( {
			domain_name: 'my-domain.com',
			product_slug: 'domain',
			supports_privacy: false,
		} );

		expect( addProductsToCart ).toHaveBeenCalledWith( [
			{
				meta: 'my-domain.com',
				product_slug: 'domain',
				extra: {
					flow_name: 'flow-name',
				},
			},
		] );

		expect( onContinue ).toHaveBeenCalledWith( [
			{ meta: 'my-domain.com', product_slug: 'domain', supports_privacy: false },
		] );
	} );

	it( 'does not call onContinue after selecting a domain if flowAllowsMultipleDomainsInCart is true', async () => {
		const addProductsToCart = jest.fn().mockReturnValue( {
			products: [
				{
					meta: 'my-domain.com',
					product_slug: 'domain',
					supports_privacy: false,
				},
			],
		} );

		mockUseShoppingCart.mockReturnValue(
			buildShoppingCart( {
				addProductsToCart,
			} )
		);

		const onContinue = jest.fn();

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				flowAllowsMultipleDomainsInCart: true,
				events: {
					...defaultProps.events,
					onContinue,
				},
			} )
		);

		await result.current.cart.onAddItem( {
			domain_name: 'my-domain.com',
			product_slug: 'domain',
			supports_privacy: false,
		} );

		expect( addProductsToCart ).toHaveBeenCalledWith( [
			{
				meta: 'my-domain.com',
				product_slug: 'domain',
				extra: {
					flow_name: 'flow-name',
				},
			},
		] );

		expect( onContinue ).not.toHaveBeenCalled();
	} );

	it( 'calls both analytics and external events', () => {
		const onExternalDomainClick = jest.fn();

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				events: {
					...defaultProps.events,
					onExternalDomainClick,
				},
			} )
		);

		result.current.events.onExternalDomainClick( 'my-domain.com' );

		expect( onExternalDomainClick ).toHaveBeenCalledWith( 'my-domain.com' );

		expect( recordUseYourDomainButtonClick ).toHaveBeenCalledWith(
			'analytics-section',
			null,
			'flow-name'
		);
	} );

	it( 'calls the submit button tracking when onSubmitButtonClick is invoked', () => {
		const onSubmitButtonClick = jest.fn();

		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchProps( {
				...defaultProps,
				events: {
					...defaultProps.events,
					onSubmitButtonClick,
				},
			} )
		);

		result.current.events.onSubmitButtonClick( 'my-domain.com' );

		expect( onSubmitButtonClick ).toHaveBeenCalledWith( 'my-domain.com' );

		expect( recordSearchFormSubmitButtonClick ).toHaveBeenCalledWith(
			'my-domain.com',
			'analytics-section',
			'flow-name'
		);
	} );
} );
