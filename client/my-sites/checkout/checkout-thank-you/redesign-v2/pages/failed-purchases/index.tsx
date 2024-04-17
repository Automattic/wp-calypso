import { CALYPSO_CONTACT } from '@automattic/urls';
import { warning, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ThankYouFooter from 'calypso/components/thank-you-v2/footer';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { FailedReceiptPurchase } from 'calypso/state/receipts/types';

import './style.scss';

type FailedPurchasesThankYouProps = {
	failedPurchases: FailedReceiptPurchase[];
	isFullPurchaseFailed?: boolean;
	receiptTotalAmount?: string;
	siteSlug?: string;
};

export const FailedPurchasesThankYou = ( {
	failedPurchases,
	isFullPurchaseFailed = true,
	receiptTotalAmount,
	siteSlug,
}: FailedPurchasesThankYouProps ) => {
	const translate = useTranslate();

	return (
		<div className="failed-purchase-thank-you">
			<div className="failed-purchase-thank-you__title">
				<Icon icon={ warning } size={ 24 } />
				{ isFullPurchaseFailed
					? translate( 'Items failed', { comment: 'Failed purchase' } )
					: translate( 'Some items failed', { comment: 'Failed purchase' } ) }
			</div>
			<div className="failed-purchase-thank-you__description">
				{ receiptTotalAmount &&
					translate(
						'Apologies for the inconvenience. We charged you the total amount of %(totalAmount)s, but due to an issue on our side, failed to add the following items to your site.',
						{
							args: { totalAmount: receiptTotalAmount },
						}
					) }
			</div>

			<div className="failed-purchase-thank-you__items">
				{ failedPurchases.map( ( item, index ) => (
					<div
						key={ `failed-purchase-${ index }-${ item.productId }` }
						className="failed-purchase-thank-you__item"
					>
						<div className="failed-purchase-thank-you__item-title">
							{ item.productName }
							{ item.meta && `: ${ item.meta }` }
						</div>
					</div>
				) ) }
			</div>
			<div className="failed-purchase-thank-you__footer">
				<ThankYouFooter
					details={ [
						{
							key: 'footer-failed-purchases-how-to-fix',
							title: translate( 'How to fix this issue' ),
							description: translate(
								'We have added credits to your account, so you can purchase these item again with no cost added.'
							),
							buttonText: translate( 'Purchase the items' ),
							buttonHref: `/checkout/${ siteSlug }`,
							buttonOnClick: () => {
								recordTracksEvent( 'calypso_thank_you_footer_link_click', {
									context: 'failed-purchase',
									type: 'try-purchase-again',
								} );
							},
						},
						{
							key: 'footer-failed-purchases-customers-support',
							title: translate( 'We are here to help' ),
							description: translate(
								"If you have any concerns or the problem persist, please don't hesitate to contact us."
							),
							buttonText: translate( 'Contact costumer support' ),
							buttonHref: CALYPSO_CONTACT,
							buttonOnClick: () => {
								recordTracksEvent( 'calypso_thank_you_footer_link_click', {
									context: 'failed-purchase',
									type: 'support',
								} );
							},
						},
					] }
				/>
			</div>
		</div>
	);
};
