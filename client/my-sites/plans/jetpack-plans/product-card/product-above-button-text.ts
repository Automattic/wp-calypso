import { JETPACK_SEARCH_PRODUCTS } from '@automattic/calypso-products';
import { numberFormat, translate, TranslateResult } from 'i18n-calypso';
import { SelectorProduct, SiteProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

export default function productAboveButtonText(
	product: SelectorProduct,
	siteProduct?: SiteProduct,
	isOwned?: boolean,
	isIncludedInPlan?: boolean
): TranslateResult | null {
	if (
		! isOwned &&
		! isIncludedInPlan &&
		siteProduct &&
		( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( product.productSlug )
	) {
		return translate(
			'*estimated price based on %(records_and_or_requests)s records and/or monthly requests',
			{
				args: {
					records_and_or_requests: numberFormat( siteProduct.tierUsage, 0 ),
				},
				comment:
					'records_and_or_requests = number of records (posts, pages, etc) in a site or monthly search requests (whichever is greater)',
			}
		);
	}
	return null;
}
