import { SubscriptionBillPeriod } from '@automattic/api-core';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import AkismetLogo from '../../../../../components/akismet-logo';
import InlineSupportLink from '../../../../../components/inline-support-link';
import { PageHeader } from '../../../../../components/page-header';
import type { Purchase, CancellationOffer } from '@automattic/api-core';
import type { FC } from 'react';

interface Props {
	purchase: Purchase;
	offer: Pick<
		CancellationOffer,
		'discounted_periods' | 'raw_price' | 'currency_code' | 'original_price'
	>;
	percentDiscount: number;
	onGetCancellationOffer: () => void;
	isAkismet?: boolean;
}

const JetpackCancellationOfferStep: FC< Props > = ( props ) => {
	const { offer, purchase, percentDiscount, isAkismet } = props;
	const { offerHeadline, renewalCopy } = useMemo( () => {
		const periods = offer.discounted_periods;
		const renewalPrice = formatCurrency( offer.raw_price, offer.currency_code );
		const fullPrice = formatCurrency( offer.original_price, offer.currency_code );
		const headlineOptions = {
			args: {
				periods,
				discount: percentDiscount,
				name: purchase.product_name,
			},
		};
		const renewalCopyOptions = {
			args: {
				periods,
				renewalPrice,
				fullPrice,
			},
			components: {
				strong: <strong />,
			},
		};

		let offerHeadline;
		let renewalCopy;

		switch ( purchase.bill_period_days ) {
			case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
				offerHeadline = sprintf(
					/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
					__( 'Get %(discount)d%% off %(name)s for your next %(periods)d two-year renewals' ),
					headlineOptions.args
				);
				renewalCopy = createInterpolateElement(
					sprintf(
						/* Translators: %(renewalPrice)d%% is this price charged when the subscription renews */
						__(
							'Your biennial subscription renews every two years. It will renew at <strong>%(renewalPrice)s/biennium</strong> for the next %(periods)d bienniums. It will then renew at <strong>%(fullPrice)s/biennium</strong> each following biennium.'
						),
						renewalCopyOptions.args
					),
					renewalCopyOptions.components
				);
				if ( 1 === periods ) {
					offerHeadline = sprintf(
						/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
						__( 'Get %(discount)d%% off %(name)s for your next two-year renewal' ),
						headlineOptions.args
					);
					renewalCopy = createInterpolateElement(
						sprintf(
							/* Translators: %(renewalPrice)d%% is this price charged when the subscription renews */
							__(
								'Your biennial subscription renews every two years. It will renew at <strong>%(renewalPrice)s/biennium</strong> for the next biennium. It will then renew at <strong>%(fullPrice)s/biennium</strong> each following biennium.'
							),
							renewalCopyOptions.args
						),
						renewalCopyOptions.components
					);
				}
				break;
			case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
				offerHeadline = sprintf(
					/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
					__( 'Get %(discount)d%% off %(name)s for the next %(periods)d years' ),
					headlineOptions.args
				);
				renewalCopy = createInterpolateElement(
					sprintf(
						/* Translators: %(renewalPrice)d%% is this price charged when the subscription renews */
						__(
							'Your annual subscription will renew at <strong>%(renewalPrice)s/year</strong> for the next %(periods)d years. It will then renew at <strong>%(fullPrice)s/year</strong> each following year.'
						),
						renewalCopyOptions.args
					),
					renewalCopyOptions.components
				);
				if ( 1 === periods ) {
					offerHeadline = sprintf(
						/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
						__( 'Get %(discount)d%% off %(name)s for the next year' ),
						headlineOptions.args
					);
					renewalCopy = createInterpolateElement(
						sprintf(
							/* Translators: %(renewalPrice)d%% is this price charged when the subscription renews */
							__(
								'Your annual subscription will renew at <strong>%(renewalPrice)s/year</strong> for the next year. It will then renew at <strong>%(fullPrice)s/year</strong> each following year.'
							),
							renewalCopyOptions.args
						),
						renewalCopyOptions.components
					);
				}
				break;
			case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
				offerHeadline = sprintf(
					/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
					__( 'Get %(discount)d%% off %(name)s for the next %(periods)d months' ),
					headlineOptions.args
				);
				renewalCopy = createInterpolateElement(
					sprintf(
						/* Translators: %(renewalPrice)d%% is this price charged when the subscription renews */
						__(
							'Your monthly subscription will renew at <strong>%(renewalPrice)s/month</strong> for the next %(periods)d months. It will then renew at <strong>%(fullPrice)s/month</strong> each following month.'
						),
						renewalCopyOptions.args
					),
					renewalCopyOptions.components
				);
				if ( 1 === periods ) {
					offerHeadline = sprintf(
						/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
						__( 'Get %(discount)d%% off %(name)s for the next month' ),
						headlineOptions.args
					);
					renewalCopy = createInterpolateElement(
						sprintf(
							/* Translators: %(renewalPrice)d%% is this price charged when the subscription renews */
							__(
								'Your monthly subscription will renew at <strong>%(renewalPrice)s/month</strong> for the next month. It will then renew at <strong>%(fullPrice)s/month</strong> each following month.'
							),
							renewalCopyOptions.args
						),
						renewalCopyOptions.components
					);
				}
		}

		return { offerHeadline, renewalCopy };
	}, [ offer, percentDiscount, purchase ] );

	return (
		<>
			<PageHeader
				title={ __( 'Thanks for your feedback' ) }
				description={ sprintf(
					/* Translators: %(brand)s is either Akismet or Jetpack */
					__(
						'We’d love to help make %(brand)s work for you. Would the special offer below interest you?'
					),
					{
						brand: isAkismet ? 'Akismet' : 'Jetpack',
					}
				) }
			/>

			<div className="jetpack-cancellation-offer__card">
				{ isAkismet ? (
					<AkismetLogo className="jetpack-cancellation-offer__logo" size={ { height: 36 } } />
				) : (
					<JetpackLogo className="jetpack-cancellation-offer__logo" full size={ 36 } />
				) }
				<p className="jetpack-cancellation-offer__headline">{ offerHeadline }</p>
				<p>
					{ createInterpolateElement(
						sprintf(
							/* Translators: %(percentDiscount)d%% is a discount percentage like 15% or 20% */
							__(
								'<strong>%(percentDiscount)d%%</strong> discount will be applied next time you are billed.'
							),
							{
								percentDiscount,
							}
						),
						{
							strong: <strong />,
						}
					) }
				</p>
				<p>{ renewalCopy }</p>
				<p className="jetpack-cancellation-offer__tos">
					{ createInterpolateElement(
						__(
							'Getting this discount means you agree to our <tosLink>Terms of Service</tosLink>. If you currently have automatic renewal enabled, you authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand <autoRenewalSupportPage>how your subscription works</autoRenewalSupportPage> and <faqCancellingSupportPage>how to cancel</faqCancellingSupportPage>.'
						),
						{
							tosLink: (
								<a
									href={ localizeUrl( 'https://wordpress.com/tos/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							autoRenewalSupportPage: <InlineSupportLink supportContext="autorenewal" />,
							faqCancellingSupportPage: <InlineSupportLink supportContext="cancel_purchase" />,
						}
					) }
				</p>
			</div>
		</>
	);
};

export default JetpackCancellationOfferStep;
