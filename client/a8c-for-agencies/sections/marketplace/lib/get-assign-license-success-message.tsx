import type { PurchasedProductsInfo } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { LocalizeProps, TranslateResult } from 'i18n-calypso';

export default function getAssignLicenseSuccessMessage(
	translate: LocalizeProps[ 'translate' ],
	{ selectedSite, selectedProducts }: PurchasedProductsInfo
): TranslateResult | null {
	const assignedProduct = selectedProducts.find( ( product ) => product.status === 'fulfilled' );

	if ( ! selectedSite || ! assignedProduct ) {
		return null;
	}

	return translate(
		'{{strong}}%(licenseItem)s{{/strong}} was successfully assigned to ' +
			'{{em}}%(selectedSite)s{{/em}}. Please allow a few minutes ' +
			'for your features to activate.',
		{
			args: {
				licenseItem: assignedProduct.name,
				selectedSite,
			},
			components: {
				strong: <strong />,
				em: <em />,
			},
		}
	);
}
