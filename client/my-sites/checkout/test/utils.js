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
			productSlug: undefined,
			selectedSite: wpcomStagingSiteSlug,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: wpcomSiteSlug,
			productSlug: undefined,
			selectedSite: wpcomStagingSiteSlug,
			expected: '',
		},
		{
			product: newProduct,
			domainOrProduct: domainSiteSlug,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: domainSiteSlug,
			domainOrProduct: newProduct,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: newProductWithDomain,
			domainOrProduct: undefined,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProductWithDomain,
		},
		{
			product: undefined,
			domainOrProduct: newProductWithDomain,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProductWithDomain,
		},
		{
			product: newProductWithDot,
			domainOrProduct: undefined,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProductWithDot,
		},
		{
			product: undefined,
			domainOrProduct: newProductWithDot,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProductWithDot,
		},
		{
			product: newProduct,
			domainOrProduct: undefined,
			productSlug: undefined,
			selectedSite: undefined,
			expected: '',
		},
		{
			product: undefined,
			domainOrProduct: newProduct,
			productSlug: undefined,
			selectedSite: undefined,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: domainSiteSlug,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			product: domainSiteSlug,
			domainOrProduct: undefined,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			product: newProduct,
			domainOrProduct: undefined,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: newProduct,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
		{
			product: subdomainSiteSlug,
			domainOrProduct: newProduct,
			productSlug: undefined,
			selectedSite: subdomainSiteSlug,
			expected: newProduct,
		},
		{
			product: newProduct,
			domainOrProduct: subdomainSiteSlug,
			productSlug: undefined,
			selectedSite: subdomainSiteSlug,
			expected: newProduct,
		},
		{
			product: undefined,
			domainOrProduct: subdomainSiteSlug,
			productSlug: undefined,
			selectedSite: subdomainSiteSlug,
			expected: '',
		},
		{
			product: undefined,
			domainOrProduct: subdomainSiteSlug,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			product: undefined,
			domainOrProduct: undefined,
			productSlug: undefined,
			selectedSite: domainSiteSlug,
			expected: '',
		},
		{
			product: undefined,
			domainOrProduct: undefined,
			productSlug: newProduct,
			selectedSite: domainSiteSlug,
			expected: newProduct,
		},
	] )(
		`returns '$expected' when :product is '$product', :domainOrProduct is '$domainOrProduct', productSlug is '$productSlug', and selected site is '$selectedSite'`,
		( { product, domainOrProduct, productSlug, selectedSite, expected } ) => {
			const store = mockStore( {
				ui: {
					selectedSiteId: getSiteIdFromDomain( selectedSite ),
				},
				sites,
			} );

			const options = productSlug ? { isJetpackCheckout: true } : {};

			const actual = getProductSlugFromContext(
				{
					store,
					params: {
						domainOrProduct,
						product,
						productSlug,
					},
				},
				options
			);

			expect( actual ).toEqual( expected );
		}
	);
} );
