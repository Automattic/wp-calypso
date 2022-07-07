import { PLAN_ANNUAL_PERIOD, PLAN_MONTHLY_PERIOD } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { CancellationOffer } from 'calypso/state/cancellation-offers/types';
import type { Purchase } from 'calypso/lib/purchases/types';

interface Props {
	purchase: Purchase;
	siteId: number;
	offer: CancellationOffer;
	percentDiscount: number;
}

const JetpackCancellationOffer: React.FC< Props > = ( props ) => {
	const { offer, purchase, percentDiscount } = props;
	const translate = useTranslate();

	const { interval, singularInterval } = useMemo( () => {
		const periods = offer.discountedPeriods;
		const billingInterval = purchase.billPeriodDays;
		let interval;
		let singularInterval;

		switch ( billingInterval ) {
			case PLAN_MONTHLY_PERIOD:
				interval = translate( '%(count)s months', { args: { count: periods } } );
				singularInterval = translate( 'month' );
				break;

			case PLAN_ANNUAL_PERIOD:
				if ( periods > 1 ) {
					interval = translate( '%(count)s years', { args: { count: periods } } );
				}
				interval = translate( 'year' );
				singularInterval = translate( 'year' );
				break;

			default:
				if ( periods > 1 ) {
					interval = translate( '%(count)s renewals', { args: { count: periods } } );
				}
				interval = translate( 'renewal' );
				singularInterval = translate( 'renewal' );
				break;
		}

		return { interval, singularInterval };
	}, [ purchase, offer ] );

	const onClickAccept = useCallback( () => {
		return;
	}, [] );

	return (
		<>
			<FormattedHeader
				headerText={ translate( 'Thanks for your feedback' ) }
				subHeaderText={ translate(
					'We’d love to help make Jetpack work for you. Would the special offer below interest you?'
				) }
				align="center"
				isSecondary={ true }
			/>

			<div className="jetpack-cancellation-offer__card">
				<JetpackLogo className="jetpack-cancellation-offer__logo" full size={ 36 } />
				<p className="jetpack-cancellation-offer__headline">
					{ translate( 'Get %(discount)d%% off %(name)s for the next %(interval)s', {
						args: {
							discount: percentDiscount,
							name: purchase.productName,
							interval: interval,
						},
					} ) }
				</p>
				<p>
					{ translate( '%(discount)d%% discount will be applied next time you are billed.', {
						args: {
							discount: percentDiscount,
						},
					} ) }
				</p>
				<p>
					{ translate(
						'Your subscription will renew at %(renewalPrice)s for the next %(interval)s. It will then renew at %(fullPrice)s each following %(singularInterval)s.',
						{
							args: {
								renewalPrice: formatCurrency( offer.rawPrice, offer.currencyCode ),
								interval: interval,
								fullPrice: formatCurrency( offer.originalPrice, offer.currencyCode ),
								singularInterval: singularInterval,
							},
						}
					) }
				</p>
				<p className="jetpack-cancellation-offer__tos">
					{ translate(
						'Getting this discount means you agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
						{
							components: {
								tosLink: (
									<a
										href={ localizeUrl( 'https://wordpress.com/tos/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								autoRenewalSupportPage: (
									<InlineSupportLink supportContext="autorenewal" showIcon={ false } />
								),
								faqCancellingSupportPage: (
									<InlineSupportLink supportContext="cancel_purchase" showIcon={ false } />
								),
							},
						}
					) }
				</p>
				<Button
					className="jetpack-cancellation-offer__accept-cta"
					primary
					onClick={ onClickAccept }
				>
					{ translate( 'Get discount' ) }
				</Button>
			</div>
		</>
	);
};

export default JetpackCancellationOffer;
