import type { UserLicenseApi, UserLicense } from './types';

export const mapSingleLicenseApiToLicense = ( license: UserLicenseApi ): UserLicense => ( {
	licenseKey: license.license_key,
	product: license.product,
	productId: license.product_id,
	subscriptionId: license.subscription_id,
} );

export const mapManyLicenseApiToLicense = ( licenses: UserLicenseApi[] ): UserLicense[] => {
	return licenses.map( mapSingleLicenseApiToLicense );
};
