import {
	PLAN_ANNUAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_BIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { applyCancellationOffer } from 'calypso/state/cancellation-offers/actions';
import getCancellationOfferApplyError from 'calypso/state/cancellation-offers/selectors/get-cancellation-offer-apply-error';
import getCancellationOfferApplySuccess from 'calypso/state/cancellation-offers/selectors/get-cancellation-offer-apply-success';
import isApplyingCancellationOffer from 'calypso/state/cancellation-offers/selectors/is-applying-cancellation-offer';
import { CancellationOffer } from 'calypso/state/cancellation-offers/types';
import type { Purchase } from 'calypso/lib/purchases/types';

interface Props {
	purchase: Purchase;
	siteId: number;
	offer: CancellationOffer;
	percentDiscount: number;
	onGetDiscount: () => void;
}

const JetpackCancellationOffer: React.FC< Props > = ( props ) => {
	const { siteId, offer, purchase, percentDiscount, onGetDiscount } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isApplyingOffer = useSelector( ( state ) =>
		isApplyingCancellationOffer( state, purchase.id )
	);
	const offerApplySuccess = useSelector( ( state ) =>
		getCancellationOfferApplySuccess( state, purchase.id )
	);
	const offerApplyError = useSelector( ( state ) =>
		getCancellationOfferApplyError( state, purchase.id )
	);
	const { offerHeadline, renewalCopy } = useMemo( () => {
		const periods = offer.discountedPeriods;
		const renewalPrice = formatCurrency( offer.rawPrice, offer.currencyCode );
		const fullPrice = formatCurrency( offer.originalPrice, offer.currencyCode );
		const headlineOptions = {
			args: {
				periods,
				discount: percentDiscount,
				name: purchase.productName,
			},
		};
		const renewalCopyOptions = {
			args: {
				periods,
				renewalPrice,
				fullPrice,
			},
		};

		let offerHeadline;
		let renewalCopy;

		switch ( purchase.billPeriodDays ) {
			case PLAN_BIENNIAL_PERIOD:
				offerHeadline = translate(
					'Get %(discount)d%% off %(name)s for your next %(periods)d two-year renewals',
					headlineOptions
				);
				renewalCopy = translate(
					'Your biennial subscription renews every two years. It will automatically renew at %(renewalPrice)s/biennium for the next %(periods)d bienniums and then %(fullPrice)s/biennium for each following biennium.',
					renewalCopyOptions
				);
				if ( 1 === periods ) {
					offerHeadline = translate(
						'Get %(discount)d%% off %(name)s for your next two-year renewal',
						headlineOptions
					);
					renewalCopy = translate(
						'Your biennial subscription renews every two years. It will automatically renew at %(renewalPrice)s/biennium for the next biennium and then %(fullPrice)s/biennium for each following biennium.',
						renewalCopyOptions
					);
				}
				break;
			case PLAN_ANNUAL_PERIOD:
				offerHeadline = translate(
					'Get %(discount)d%% off %(name)s for the next %(periods)d years',
					headlineOptions
				);
				renewalCopy = translate(
					'Your annual subscription will automatically renew at %(renewalPrice)s/year for the next %(periods)d years and then %(fullPrice)s/year for each following year.',
					renewalCopyOptions
				);
				if ( 1 === periods ) {
					offerHeadline = translate(
						'Get %(discount)d%% off %(name)s for the next year',
						headlineOptions
					);
					renewalCopy = translate(
						'Your annual subscription will automatically renew at %(renewalPrice)s/year for the next year and then %(fullPrice)s/year for each following year.',
						renewalCopyOptions
					);
				}
				break;
			case PLAN_MONTHLY_PERIOD:
				offerHeadline = translate(
					'Get %(discount)d%% off %(name)s for the next %(periods)d months',
					headlineOptions
				);
				renewalCopy = translate(
					'Your monthly subscription will automatically renew at %(renewalPrice)s/month for the next %(periods)d months and then %(fullPrice)s/month for each following month.',
					renewalCopyOptions
				);
				if ( 1 === periods ) {
					offerHeadline = translate(
						'Get %(discount)d%% off %(name)s for the next year',
						headlineOptions
					);
					renewalCopy = translate(
						'Your monthly subscription will automatically renew at %(renewalPrice)s/month for the next month and then %(fullPrice)s/month for each following month.',
						renewalCopyOptions
					);
				}
		}

		return { offerHeadline, renewalCopy };
	}, [ offer, percentDiscount ] );

	const onClickAccept = useCallback( () => {
		// is the offer being claimed/ is there already a success or error
		if ( ! isApplyingOffer && offerApplySuccess === false && ! offerApplyError ) {
			dispatch( applyCancellationOffer( siteId, purchase.id ) );
			onGetDiscount(); // Takes care of analytics.
		}
	}, [ isApplyingOffer, offerApplySuccess, offerApplyError ] );

	const getErrorOutput = useMemo( () => {
		if ( offerApplyError ) {
			switch ( offerApplyError.code ) {
				case 'invalid_offer':
					return (
						<p className="jetpack-cancellation-offer__error-text">
							{ translate(
								'This discount appears to be invalid, please try reloading the purchase page.'
							) }
						</p>
					);
				default:
					return (
						<p className="jetpack-cancellation-offer__error-text">
							{ translate( 'There was an error getting the discount!' ) }
						</p>
					);
			}
		}

		return null;
	}, [ offerApplyError ] );

	return (
		<>
			<FormattedHeader
				headerText={ translate( 'Thanks for your feedback' ) }
				subHeaderText={ translate(
					'We’d love to help make Jetpack work for you. Would the special offer below interest you?'
				) }
				align="center"
				isSecondary
			/>

			<div className="jetpack-cancellation-offer__card">
				<JetpackLogo className="jetpack-cancellation-offer__logo" full size={ 36 } />
				<p className="jetpack-cancellation-offer__headline">{ offerHeadline }</p>
				<p>
					{ translate(
						'%(percentDiscount)d%% discount will be applied next time you are billed. ',
						{
							args: {
								percentDiscount,
							},
						}
					) }
				</p>
				<p>{ renewalCopy }</p>
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
					disabled={ isApplyingOffer || offerApplyError }
					busy={ isApplyingOffer }
				>
					{ isApplyingOffer ? translate( 'Getting Discount' ) : translate( 'Get discount' ) }
				</Button>
				{ getErrorOutput }
			</div>
		</>
	);
};

export default JetpackCancellationOffer;
