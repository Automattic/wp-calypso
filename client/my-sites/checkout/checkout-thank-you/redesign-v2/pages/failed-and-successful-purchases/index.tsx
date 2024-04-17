import { useTranslate } from 'i18n-calypso';
import ThankYouHeader from 'calypso/components/thank-you-v2/header';
import { FailedPurchasesThankYou } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/pages/failed-purchases';
import type { FailedReceiptPurchase } from 'calypso/state/receipts/types';

import './style.scss';

type FailedAndSuccessfulPurchasesThankYouProps = {
	failedPurchases: FailedReceiptPurchase[];
	receiptTotalAmount?: string;
	siteSlug?: string;
	successfulPurchasesComponent: React.ReactElement;
};

export const FailedAndSuccessfulPurchasesThankYou = ( {
	failedPurchases,
	receiptTotalAmount,
	siteSlug,
	successfulPurchasesComponent,
}: FailedAndSuccessfulPurchasesThankYouProps ) => {
	const translate = useTranslate();

	return (
		<>
			<ThankYouHeader
				title={ translate( 'Almost there', {
					comment:
						'Title for the congrats page after purchasing a few WP products, but not all successfully',
				} ) }
				subtitle={ translate( 'The following items have been successfully purchased' ) }
			/>
			<div className="failed-and-successful-purchases-details__body">
				{ successfulPurchasesComponent }
			</div>
			<FailedPurchasesThankYou
				isFullPurchaseFailed={ false }
				siteSlug={ siteSlug }
				failedPurchases={ failedPurchases }
				receiptTotalAmount={ receiptTotalAmount }
			/>
		</>
	);
};
