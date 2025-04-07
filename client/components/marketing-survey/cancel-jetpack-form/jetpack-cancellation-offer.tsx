import {
	PLAN_ANNUAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_BIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate, formatCurrency } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import AkismetLogo from 'calypso/components/akismet-logo';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { useDispatch, useSelector } from 'calypso/state';
import { applyCancellationOffer } from 'calypso/state/cancellation-offers/actions';
import getCancellationOfferApplyError from 'calypso/state/cancellation-offers/selectors/get-cancellation-offer-apply-error';
import getCancellationOfferApplySuccess from 'calypso/state/cancellation-offers/selectors/get-cancellation-offer-apply-success';
import isApplyingCancellationOffer from 'calypso/state/cancellation-offers/selectors/is-applying-cancellation-offer';
import { CancellationOffer } from 'calypso/state/cancellation-offers/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { FC } from 'react';

interface Props {
	purchase: Purchase;
	siteId: number;
	offer: CancellationOffer;
	percentDiscount: number;
	onGetDiscount: () => void;
	isAkismet?: boolean;
}

const JetpackCancellationOffer: FC< Props > = ( props ) => {
	const { siteId, offer, purchase, percentDiscount, onGetDiscount, isAkismet } = props;
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
			components: {
				strong: <strong />,
			},
		};

		let offerHeadline;
		let renewalCopy;

		switch ( purchase.billPeriodDays ) {
			case PLAN_BIENNIAL_PERIOD:
				/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
				offerHeadline = translate(
					'Get %(discount)d%% off %(name)s for your next %(periods)d two-year renewals',
					headlineOptions
				);
				renewalCopy = translate(
					'Your biennial subscription renews every two years. It will renew at {{strong}}%(renewalPrice)s/biennium{{/strong}} for the next %(periods)d bienniums. It will then renew at {{strong}}%(fullPrice)s/biennium{{/strong}} each following biennium.',
					renewalCopyOptions
				);
				if ( 1 === periods ) {
					/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
					offerHeadline = translate(
						'Get %(discount)d%% off %(name)s for your next two-year renewal',
						headlineOptions
					);
					renewalCopy = translate(
						'Your biennial subscription renews every two years. It will renew at {{strong}}%(renewalPrice)s/biennium{{/strong}} for the next biennium. It will then renew at {{strong}}%(fullPrice)s/biennium{{/strong}} each following biennium.',
						renewalCopyOptions
					);
				}
				break;
			case PLAN_ANNUAL_PERIOD:
				/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
				offerHeadline = translate(
					'Get %(discount)d%% off %(name)s for the next %(periods)d years',
					headlineOptions
				);
				renewalCopy = translate(
					'Your annual subscription will renew at {{strong}}%(renewalPrice)s/year{{/strong}} for the next %(periods)d years. It will then renew at {{strong}}%(fullPrice)s/year{{/strong}} each following year.',
					renewalCopyOptions
				);
				if ( 1 === periods ) {
					/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
					offerHeadline = translate(
						'Get %(discount)d%% off %(name)s for the next year',
						headlineOptions
					);
					renewalCopy = translate(
						'Your annual subscription will renew at {{strong}}%(renewalPrice)s/year{{/strong}} for the next year. It will then renew at {{strong}}%(fullPrice)s/year{{/strong}} each following year.',
						renewalCopyOptions
					);
				}
				break;
			case PLAN_MONTHLY_PERIOD:
				/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
				offerHeadline = translate(
					'Get %(discount)d%% off %(name)s for the next %(periods)d months',
					headlineOptions
				);
				renewalCopy = translate(
					'Your monthly subscription will renew at {{strong}}%(renewalPrice)s/month{{/strong}} for the next %(periods)d months. It will then renew at {{strong}}%(fullPrice)s/month{{/strong}} each following month.',
					renewalCopyOptions
				);
				if ( 1 === periods ) {
					/* Translators: %(discount)d%% is a discount percentage like 15% or 20% */
					offerHeadline = translate(
						'Get %(discount)d%% off %(name)s for the next month',
						headlineOptions
					);
					renewalCopy = translate(
						'Your monthly subscription will renew at {{strong}}%(renewalPrice)s/month{{/strong}} for the next month. It will then renew at {{strong}}%(fullPrice)s/month{{/strong}} each following month.',
						renewalCopyOptions
					);
				}
		}

		return { offerHeadline, renewalCopy };
	}, [ offer, percentDiscount, purchase, translate ] );

	const onClickAccept = useCallback( () => {
		// is the offer being claimed/ is there already a success or error
		if ( ! isApplyingOffer && offerApplySuccess === false && ! offerApplyError ) {
			dispatch( applyCancellationOffer( siteId, purchase.id ) );
			onGetDiscount(); // Takes care of analytics.
		}
	}, [
		isApplyingOffer,
		offerApplySuccess,
		offerApplyError,
		siteId,
		purchase.id,
		onGetDiscount,
		dispatch,
	] );

	const getErrorOutput = useMemo( () => {
		if ( offerApplyError ) {
			const getErrorMessage = () => {
				switch ( offerApplyError.code ) {
					case 'invalid_offer':
						return translate(
							'This discount appears to be invalid, please try reloading the purchase page.'
						);
					default:
						return translate( 'There was an error getting the discount!' );
				}
			};

			return <p className="jetpack-cancellation-offer__error-text">{ getErrorMessage() }</p>;
		}

		return null;
	}, [ offerApplyError, translate ] );

	return (
		<>
			<FormattedHeader
				headerText={ translate( 'Thanks for your feedback' ) }
				subHeaderText={
					/* Translators: %(brand)s is either Akismet or Jetpack */
					translate(
						'We’d love to help make %(brand)s work for you. Would the special offer below interest you?',
						{
							args: {
								brand: isAkismet ? 'Akismet' : 'Jetpack',
							},
						}
					)
				}
				align="center"
				isSecondary
			/>

			<div className="jetpack-cancellation-offer__card">
				{ isAkismet ? (
					<AkismetLogo className="jetpack-cancellation-offer__logo" size={ { height: 36 } } />
				) : (
					<JetpackLogo className="jetpack-cancellation-offer__logo" full size={ 36 } />
				) }
				<p className="jetpack-cancellation-offer__headline">{ offerHeadline }</p>
				<p>
					{
						/* Translators: %(percentDiscount)d%% is a discount percentage like 15% or 20% */
						translate(
							'{{strong}}%(percentDiscount)d%%{{/strong}} discount will be applied next time you are billed. ',
							{
								args: {
									percentDiscount,
								},
								components: {
									strong: <strong />,
								},
							}
						)
					}
				</p>
				<p>{ renewalCopy }</p>
				<p className="jetpack-cancellation-offer__tos">
					{ translate(
						'Getting this discount means you agree to our {{tosLink}}Terms of Service{{/tosLink}}. If you currently have automatic renewal enabled, you authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
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
									<InlineSupportLink
										supportContext="autorenewal"
										showIcon={ false }
										showSupportModal={ false }
									/>
								),
								faqCancellingSupportPage: (
									<InlineSupportLink
										supportContext="cancel_purchase"
										showIcon={ false }
										showSupportModal={ false }
									/>
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
