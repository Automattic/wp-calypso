import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import { DiscountOrOfferTerms } from 'calypso/my-sites/email/email-providers-comparison/price/discount-or-offer-terms';
import PriceInformation from 'calypso/my-sites/email/email-providers-comparison/price/price-information';
import useGetDomainIntroductoryOfferEligibility from 'calypso/my-sites/email/email-providers-comparison/price/use-get-domain-introductory-offer-eligibility';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

type EmailPriceProps = {
	domain?: ResponseDomain;
	intervalLength: IntervalLength;
	isDomainInCart: boolean;
	product: ProductListItem | null;
};

const PriceAndBadgeWithOfferAndDiscountTerms = ( {
	domain,
	intervalLength,
	isDomainInCart,
	product,
}: EmailPriceProps ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const { isEligibleForIntroductoryOffer, isEligibleForIntroductoryOfferFreeTrial } =
		useGetDomainIntroductoryOfferEligibility( { domain, isDomainInCart, product } );
	const isDiscounted = hasDiscount( product );

	return (
		<>
			<DiscountOrOfferTerms
				isDiscounted={ isDiscounted }
				isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
				isEligibleForIntroductoryOfferFreeTrial={ isEligibleForIntroductoryOfferFreeTrial }
				product={ product }
			/>

			<PriceBadge
				priceInformation={
					<PriceInformation
						domain={ domain }
						isDomainInCart={ isDomainInCart }
						product={ product }
					/>
				}
				price={
					<PriceWithInterval
						currencyCode={ currencyCode ?? '' }
						intervalLength={ intervalLength }
						isDiscounted={ isDiscounted }
						isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
						product={ product }
					/>
				}
			/>
		</>
	);
};

export { PriceAndBadgeWithOfferAndDiscountTerms };
