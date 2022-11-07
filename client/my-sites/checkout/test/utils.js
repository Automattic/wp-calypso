import configureStore from 'redux-mock-store';
import { getProductSlugFromContext } from '../utils';

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
