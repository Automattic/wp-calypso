import { productHasFeatureType } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getProductSlugFromLicenseKey } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductInfo from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-info';

export const checkLicenseKeyForFeature = ( featureType: string, licenseKey: string ) => {
	// Truncate unneeded data (e.g. 'jetpack-backup-t1')
	const licenseProductSlug = getProductSlugFromLicenseKey( licenseKey );

	if ( ! licenseProductSlug ) {
		return false;
	}

	// Convert to a monthly product slug (e.g. 'jetpack_backup_t1_monthly')
	const monthlyProduct = getProductInfo( licenseProductSlug );

	if ( ! monthlyProduct ) {
		return false;
	}

	// Verify product has feature
	const hasFeature = productHasFeatureType( monthlyProduct.productSlug, featureType );
	return hasFeature;
};
