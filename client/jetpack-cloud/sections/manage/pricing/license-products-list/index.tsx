import { useTranslate } from 'i18n-calypso';
import { PRODUCT_FILTER_ALL } from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/constants';
import useProductAndPlans from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/licenses-form/hooks/use-product-and-plans';
import { MostPopularPlans } from './most-popular-plans';

type ProductsListProps = {
	bundleSize: number;
};

export const LicenseProductsList = ( { bundleSize }: ProductsListProps ) => {
	const translate = useTranslate();
	const productSearchQuery = '';
	const selectedProductFilter = PRODUCT_FILTER_ALL;
	const selectedSite = null;

	const { plans } = useProductAndPlans( {
		selectedSite,
		selectedProductFilter,
		selectedBundleSize: bundleSize,
		productSearchQuery,
	} );

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopularPlans heading={ translate( 'Bundle and save' ) } items={ plans } />
		</div>
	);
};
