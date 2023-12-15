import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import useSubmitForm from '../hooks/use-submit-form';
import { getTotalInvoiceValue } from '../lib/pricing';
import PricingBreakdown from './pricing-breakdown';
import type { SelectedLicenseProp } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

export default function PricingSummary( {
	selectedLicenses,
	selectedSite,
}: {
	selectedLicenses: SelectedLicenseProp[];
	selectedSite?: SiteDetails | null;
} ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );
	const { discountedCost, actualCost } = getTotalInvoiceValue( userProducts, selectedLicenses );

	const selectedLicenseCount = selectedLicenses
		.map( ( license ) => license.quantity )
		.reduce( ( a, b ) => a + b, 0 );

	const { isReady: isFormReady, submitForm } = useSubmitForm( selectedSite );
	const handleCTAClick = useCallback( () => {
		if ( ! isFormReady ) {
			return;
		}

		// TODO: Add tracking
		submitForm( selectedLicenses );
	}, [ isFormReady, selectedLicenses, submitForm ] );

	const learnMoreLink =
		'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-billing-payment-faqs';

	const currency = selectedLicenses[ 0 ].currency; // FIXME: Fix if multiple currencies are supported

	return (
		<>
			<div className="review-licenses__pricing">
				<span className="review-licenses__pricing-discounted">
					{ formatCurrency( discountedCost, currency ) }
				</span>
				<span className="review-licenses__pricing-original">
					{ formatCurrency( actualCost, currency ) }
				</span>
				<div className="review-licenses__pricing-interval">{ translate( '/month' ) }</div>
			</div>
			<Button
				primary
				className="review-licenses__cta-button"
				onClick={ handleCTAClick }
				busy={ ! isFormReady }
			>
				{ translate( 'Issue %(numLicenses)d license', 'Issue %(numLicenses)d licenses', {
					context: 'button label',
					count: selectedLicenseCount,
					args: {
						numLicenses: selectedLicenseCount,
					},
				} ) }
			</Button>
			<div className="review-licenses__notice">
				{ translate(
					'You will be billed at the end of every month. Your first month may be less than the above amount. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <a href={ learnMoreLink } target="_blank" rel="noopener noreferrer" />,
						},
					}
				) }
			</div>
			<PricingBreakdown
				userProducts={ userProducts }
				selectedLicenses={ selectedLicenses }
				selectedSite={ selectedSite }
			/>
		</>
	);
}
