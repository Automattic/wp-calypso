import { useTranslate } from 'i18n-calypso';
import useProductAndPlans from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/licenses-form/hooks/use-product-and-plans';
import { AllLicenseItems } from './all-license-items';
import { MostPopularPlans } from './most-popular-plans';

type ProductsListProps = {
	bundleSize: number;
};

export const LicenseProductsList = ( { bundleSize }: ProductsListProps ) => {
	const translate = useTranslate();
	const productSearchQuery = '';
	const selectedProductFilter = '';
	const selectedSite = null;
	const usePublicQuery = true;

	const { plans, products, backupAddons, wooExtensions } = useProductAndPlans( {
		selectedSite,
		selectedProductFilter,
		productSearchQuery,
		usePublicQuery,
	} );

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopularPlans
				heading={ translate( 'Plans' ) }
				subHeading={ translate(
					'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
				) }
				items={ plans }
				bundleSize={ bundleSize }
			/>
			<AllLicenseItems
				heading={ translate( 'Products' ) }
				subHeading={ translate(
					'Mix and match powerful security, performance, and growth tools for your site.'
				) }
				items={ products }
				bundleSize={ bundleSize }
			/>
			<AllLicenseItems
				heading={ translate( 'VaultPress Backup Add-ons' ) }
				subHeading={ translate(
					'Add additional storage to your current VaultPress Backup plans.'
				) }
				items={ backupAddons }
				bundleSize={ bundleSize }
			/>
			<AllLicenseItems
				heading={ translate( 'WooCommerce Extensions' ) }
				subHeading={ translate(
					'You must have WooCommerce installed to utilize these paid extensions.'
				) }
				items={ wooExtensions }
				bundleSize={ bundleSize }
			/>
		</div>
	);
};
