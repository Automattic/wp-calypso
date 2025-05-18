/**
 * @jest-environment jsdom
 */
import {
	PLAN_PERSONAL_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import configureStore from 'redux-mock-store';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { getProductSlugFromContext, useGetWpcomPlanTotalIfPaidMonthly } from '../utils';

jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => jest.fn()
);

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );

const mockStore = configureStore();

const emptyContext = {
	params: {
		domainOrProduct: undefined,
		product: undefined,
		productSlug: undefined,
	},
	pathname: '',
	query: {},
};

function createMockContext( options ) {
	return {
		...emptyContext,
		...options,
	};
}

describe( 'getProductSlugFromContext', () => {
	const domainSiteId = 1;
	const wpcomSiteId = 2;
	const subdomainSiteId = 3;
	const domainSiteSlug = 'example.com';
	const wpcomSiteSlug = 'example.wordpress.com';
	const subdomainSiteSlug = 'example.com::blog';
	const wpcomStagingSiteSlug = 'example.wpcomstaging.com';
	const newProduct = 'jetpack-product';
	const newProductWithDomain = 'domain-mapping:example.com';
	// Note that `%25` decodes to a slash for product slugs because of how
	// calypso routing predecodes urls. See `decodeProductFromUrl()`.
	const newProductWithDot = 'no-adverts%25no-adverts.php';
	const sites = {
		items: {
			[ domainSiteId ]: {
				id: domainSiteId,
				slug: domainSiteSlug,
			},
			[ wpcomSiteId ]: {
				id: wpcomSiteId,
				slug: wpcomStagingSiteSlug,
			},
			[ subdomainSiteId ]: {
				id: subdomainSiteId,
				slug: subdomainSiteSlug,
			},
		},
	};
	function getSiteIdFromDomain( domain ) {
		return Object.values( sites.items ).find( ( item ) => item.slug === domain )?.id;
	}

	it.each( [
		{
			context: createMockContext( {
				params: {
					product: newProduct,
					domainOrProduct: wpcomSiteSlug,
				},
			} ),
			selectedSite: wpcomStagingSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: wpcomSiteSlug,
					productSlug: undefined,
				},
			} ),
			selectedSite: wpcomStagingSiteSlug,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: newProduct,
					domainOrProduct: domainSiteSlug,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: domainSiteSlug,
					domainOrProduct: newProduct,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: newProductWithDomain,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProductWithDomain,
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: newProductWithDomain,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProductWithDomain,
		},
		{
			context: createMockContext( {
				params: {
					product: newProductWithDot,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProductWithDot,
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: newProductWithDot,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProductWithDot,
		},
		{
			context: createMockContext( {
				params: {
					product: newProduct,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
			} ),
			selectedSite: undefined,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: newProduct,
					productSlug: undefined,
				},
			} ),
			selectedSite: undefined,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: domainSiteSlug,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: domainSiteSlug,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: newProduct,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: newProduct,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: subdomainSiteSlug,
					domainOrProduct: newProduct,
					productSlug: undefined,
				},
			} ),
			selectedSite: subdomainSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: newProduct,
					domainOrProduct: subdomainSiteSlug,
					productSlug: undefined,
				},
			} ),
			selectedSite: subdomainSiteSlug,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: subdomainSiteSlug,
					productSlug: undefined,
				},
			} ),
			selectedSite: subdomainSiteSlug,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: subdomainSiteSlug,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
			} ),
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			context: createMockContext( {
				params: {
					product: undefined,
					domainOrProduct: undefined,
					productSlug: newProduct,
				},
				pathname: '/checkout/jetpack',
				query: {
					flow: 'coming_from_login',
					purchasetoken: 'testtoken',
				},
			} ),
			selectedSite: undefined,
			expected: newProduct,
		},
		{
			context: createMockContext( {
				params: {
					product: newProduct,
					domainOrProduct: undefined,
					productSlug: undefined,
				},
				pathname: `/checkout/${ newProduct }/gift/1234`,
			} ),
			selectedSite: undefined,
			expected: newProduct,
		},
	] )(
		`returns '$expected' when params is '$context.params', path is '$context.pathname', query is '$context.query', and selected site is '$selectedSite'`,
		( { context, selectedSite, expected } ) => {
			const store = mockStore( {
				ui: {
					selectedSiteId: getSiteIdFromDomain( selectedSite ),
				},
				sites,
			} );

			const actual = getProductSlugFromContext( {
				...context,
				store,
			} );

			expect( actual ).toEqual( expected );
		}
	);
} );

describe( 'useGetWpcomPlanTotalIfPaidMonthly', () => {
	const business_2years = {
		...getEmptyResponseCartProduct(),
		product_name: 'Dotcom Business',
		product_slug: PLAN_BUSINESS_2_YEARS,
		currency: 'USD',
		extra: {},
		meta: 'test',
		product_id: 1,
		volume: 1,
		is_domain_registration: false,
		item_original_cost_integer: 100,
		item_subtotal_integer: 100,
		bill_period: '365',
		months_per_bill_period: 24,
	};
	const personal_monthly = {
		...getEmptyResponseCartProduct(),
		product_name: 'Dotcom Personal',
		product_slug: PLAN_PERSONAL_MONTHLY,
		currency: 'USD',
		extra: {},
		meta: 'test',
		product_id: 2,
		volume: 1,
		is_domain_registration: false,
		item_original_cost_integer: 50,
		item_subtotal_integer: 50,
		bill_period: '31',
		months_per_bill_period: 1,
	};
	const jetpack_yearly = {
		...getEmptyResponseCartProduct(),
		product_name: 'Jetpack Yearly',
		product_slug: PRODUCT_JETPACK_BACKUP_T0_YEARLY,
		currency: 'USD',
		extra: {},
		meta: 'test',
		product_id: 3,
		volume: 1,
		is_domain_registration: false,
		item_original_cost_integer: 70,
		item_subtotal_integer: 70,
		bill_period: '365',
		months_per_bill_period: 12,
	};

	beforeEach( () => {
		jest.resetAllMocks();
		useCheckPlanAvailabilityForPurchase.mockImplementation( ( { planSlugs } ) =>
			planSlugs.reduce( ( acc, planSlug ) => {
				return {
					...acc,
					[ planSlug ]: true,
				};
			}, {} )
		);
	} );

	it( 'returns calculated total only for non-monthly wpcom products', () => {
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 1000 },
			},
			[ PLAN_BUSINESS_MONTHLY ]: {
				originalPrice: { monthly: 4000 },
			},
		} ) );

		const { result } = renderHookWithProvider( () =>
			useGetWpcomPlanTotalIfPaidMonthly( [ business_2years, personal_monthly, jetpack_yearly ] )
		);
		expect( result.current ).toStrictEqual( { 'business-bundle-2y': 96000 } ); // 24 * 40
	} );

	it( 'correctly handles malformed plans data', () => {
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_BUSINESS_MONTHLY ]: {
				amount: 5,
			},
		} ) );
		const { result } = renderHookWithProvider( () =>
			useGetWpcomPlanTotalIfPaidMonthly( [ business_2years, personal_monthly, jetpack_yearly ] )
		);
		expect( result.current ).toStrictEqual( { 'business-bundle-2y': 0 } );
	} );
} );
