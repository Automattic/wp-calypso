import { getIntroductoryOfferIntervalDisplay } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import {
	isWithinIntroductoryOfferPeriod,
	isIntroductoryOfferFreeTrial,
} from 'calypso/lib/purchases';

function PurchaseMetaIntroductoryOfferDetail( { purchase } ) {
	const translate = useTranslate();

	if ( ! isWithinIntroductoryOfferPeriod( purchase ) ) {
		return null;
	}

	const text = getIntroductoryOfferIntervalDisplay(
		translate,
		purchase.introductoryOffer.intervalUnit,
		purchase.introductoryOffer.intervalCount,
		isIntroductoryOfferFreeTrial( purchase ),
		'manage-purchases',
		purchase.introductoryOffer.remainingRenewalsUsingOffer
	);

	let regularPriceText = null;
	if ( purchase.introductoryOffer.isNextRenewalUsingOffer ) {
		regularPriceText = translate(
			'After the offer ends, the subscription price will be %(regularPrice)s',
			{
				args: {
					regularPrice: purchase.regularPriceText,
				},
			}
		);
	} else if ( purchase.introductoryOffer.isNextRenewalProrated ) {
		regularPriceText = translate(
			'After the first renewal, the subscription price will be %(regularPrice)s',
			{
				args: {
					regularPrice: purchase.regularPriceText,
				},
			}
		);
	}

	return (
		<>
			<br />
			<small> { text } </small>
			{ regularPriceText && (
				<>
					{ ' ' }
					<br /> <small> { regularPriceText } </small>{ ' ' }
				</>
			) }
		</>
	);
}

export default PurchaseMetaIntroductoryOfferDetail;
