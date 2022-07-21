import configureStore from 'redux-mock-store';
import { getProductSlugFromContext } from '../utils';

const mockStore = configureStore();

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
			product: newProduct,
			domainOrProduct: wpcomSiteSlug,
			selectedSite: wpcomStagingSiteSlug,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: wpcomSiteSlug,
			selectedSite: wpcomStagingSiteSlug,
			expected: '',
		},
		{
			product: newProduct,
			domainOrProduct: domainSiteSlug,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: domainSiteSlug,
			domainOrProduct: newProduct,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: newProductWithDomain,
			domainOrProduct: undefined,
			selectedSite: domainSiteSlug,
			expected: newProductWithDomain,
		},
		{
			product: undefined,
			domainOrProduct: newProductWithDomain,
			selectedSite: domainSiteSlug,
			expected: newProductWithDomain,
		},
		{
			product: newProductWithDot,
			domainOrProduct: undefined,
			selectedSite: domainSiteSlug,
			expected: newProductWithDot,
		},
		{
			product: undefined,
			domainOrProduct: newProductWithDot,
			selectedSite: domainSiteSlug,
			expected: newProductWithDot,
		},
		{
			product: newProduct,
			domainOrProduct: undefined,
			selectedSite: undefined,
			expected: '',
		},
		{
			product: undefined,
			domainOrProduct: newProduct,
			selectedSite: undefined,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: domainSiteSlug,
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			product: domainSiteSlug,
			domainOrProduct: undefined,
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			product: newProduct,
			domainOrProduct: undefined,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: newProduct,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: subdomainSiteSlug,
			domainOrProduct: newProduct,
			selectedSite: subdomainSiteSlug,
			expected: newProduct,
		},
		{
			product: newProduct,
			domainOrProduct: subdomainSiteSlug,
			selectedSite: subdomainSiteSlug,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: undefined,
			selectedSite: domainSiteSlug,
			expected: '',
		},
	] )(
		`returns '$expected' when :product is '$product' and :domainOrProduct is '$domainOrProduct' and selected site is '$selectedSite'`,
		( { product, domainOrProduct, selectedSite, expected } ) => {
			const store = mockStore( {
				ui: {
					selectedSiteId: getSiteIdFromDomain( selectedSite ),
				},
				sites,
			} );

			const actual = getProductSlugFromContext( {
				store,
				params: {
					domainOrProduct,
					product,
				},
			} );

			expect( actual ).toEqual( expected );
		}
	);
} );
