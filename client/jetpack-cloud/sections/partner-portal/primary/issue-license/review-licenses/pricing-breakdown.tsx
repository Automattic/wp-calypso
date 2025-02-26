import { Icon, check } from '@wordpress/icons';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useLicenseLightboxData } from '../../../license-lightbox/hooks/use-license-lightbox-data';
import { getProductPricingInfo, getTotalInvoiceValue } from '../lib/pricing';
import type { SelectedLicenseProp } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const LicenseItem = ( {
	license,
	userProducts,
	selectedSite,
}: {
	license: SelectedLicenseProp;
	userProducts: Record< string, ProductListItem >;
	selectedSite?: SiteDetails | null;
} ) => {
	const { actualCost, discountedCost } = getProductPricingInfo(
		userProducts,
		license,
		license.quantity
	);

	const { title } = useLicenseLightboxData( license );

	return (
		<div className="review-licenses__license-item">
			<span className="review-licenses__license-item-column">
				<Icon size={ 24 } icon={ check } />
				{ title } { ! selectedSite && `x ${ license.quantity }` }
			</span>
			<span className="review-licenses__license-item-column">
				{ formatCurrency( discountedCost, license.currency ) }
				<span className="review-licenses__license-item-actual-cost">
					{ formatCurrency( actualCost, license.currency ) }
				</span>
			</span>
		</div>
	);
};

export default function PricingBreakdown( {
	selectedLicenses,
	userProducts,
	selectedSite,
}: {
	selectedLicenses: SelectedLicenseProp[];
	userProducts: Record< string, ProductListItem >;
	selectedSite?: SiteDetails | null;
} ) {
	const translate = useTranslate();

	const { discountedCost } = getTotalInvoiceValue( userProducts, selectedLicenses );

	return (
		<>
			<div className="review-licenses__pricing-breakdown">
				{ selectedLicenses.map( ( license ) => (
					<LicenseItem
						key={ `license-item-${ license.product_id }-${ license.quantity }` }
						license={ license }
						userProducts={ userProducts }
						selectedSite={ selectedSite }
					/>
				) ) }
			</div>
			<div className="review-licenses__pricing-breakdown-total">
				<span>{ translate( 'Total:' ) }</span>
				<span>{ formatCurrency( discountedCost, selectedLicenses[ 0 ].currency ) }</span>
			</div>
		</>
	);
}
