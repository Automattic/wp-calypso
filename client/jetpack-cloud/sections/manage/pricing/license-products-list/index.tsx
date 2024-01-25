import { useTranslate } from 'i18n-calypso';
import useProductAndPlans from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/licenses-form/hooks/use-product-and-plans';
import { MostPopularPlans } from './most-popular-plans';

type ProductsListProps = {
	bundleSize: number;
};

export const LicenseProductsList = ( { bundleSize }: ProductsListProps ) => {
	const translate = useTranslate();
	const productSearchQuery = '';
	const selectedProductFilter = '';
	const selectedSite = null;

	const { plans } = useProductAndPlans( {
		selectedSite,
		selectedProductFilter,
		selectedBundleSize: bundleSize,
		productSearchQuery,
	} );

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopularPlans
				heading={ translate( 'Plans' ) }
				subHeading={ translate(
					'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
				) }
				items={ plans }
			/>
		</div>
	);
};
