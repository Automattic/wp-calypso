import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { isWithinIntroductoryOfferPeriod } from 'calypso/lib/purchases';
import { Purchase } from 'calypso/lib/purchases/types';

function PurchaseMetaIntroductoryOfferDetail( { purchase }: { purchase: Purchase } ) {
	const translate = useTranslate();

	if ( ! isWithinIntroductoryOfferPeriod( purchase ) ) {
		return null;
	}
	if ( purchase?.introductoryOffer && purchase.introductoryOffer !== null ) {
		let regularPriceText = null;
		if ( purchase.introductoryOffer.isNextRenewalUsingOffer ) {
			regularPriceText = translate(
				'After the offer ends, the subscription price will be %(regularPrice)s',
				{
					args: {
						regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				}
			);
		} else if ( purchase.introductoryOffer.isNextRenewalProrated ) {
			regularPriceText = translate(
				'After the first renewal, the subscription price will be %(regularPrice)s',
				{
					args: {
						regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				}
			);
		}

		return (
			<>
				<br />
				{ regularPriceText && (
					<>
						{ ' ' }
						<br /> <small> { regularPriceText } </small>{ ' ' }
					</>
				) }
			</>
		);
	}
}

export default PurchaseMetaIntroductoryOfferDetail;
