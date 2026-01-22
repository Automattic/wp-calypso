/* eslint-disable wpcalypso/jsx-classname-namespace */

import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceInformation from 'calypso/my-sites/email/email-providers-comparison/price/price-information';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './style.scss';

const getTitanProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? TITAN_MAIL_MONTHLY_SLUG
		: TITAN_MAIL_YEARLY_SLUG;
};

const getTitanFreeTrialMonths = ( product: ProductListItem | null ): number => {
	return product?.introductory_offer?.interval_unit === 'year' ? 12 : 3;
};

type ProfessionalEmailPriceProps = {
	domain?: ResponseDomain;
	intervalLength: IntervalLength;
	isDomainInCart: boolean;
};

const ProfessionalEmailPrice = ( {
	domain,
	intervalLength,
	isDomainInCart,
}: ProfessionalEmailPriceProps ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const productSlug = getTitanProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = domain?.blogId ?? selectedSite?.ID;
	const siteProduct = useSelector( ( state ) =>
		getSiteAvailableProduct( state, siteId, productSlug )
	);

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	const isEligibleForFreeTrial =
		isDomainInCart ||
		isDomainEligibleForTitanFreeTrial( { domain, product: siteProduct ?? product } );
	const offerMonths = getTitanFreeTrialMonths( siteProduct ?? product );
	const freeTrialLabel =
		offerMonths === 12
			? translate( '%(months)d months free', {
					args: {
						months: offerMonths,
					},
					comment: '%(months)d is the number of free trial months',
			  } )
			: translate( '3 months free' );

	const priceWithInterval = (
		<PriceWithInterval
			currencyCode={ currencyCode ?? '' }
			intervalLength={ intervalLength }
			isEligibleForIntroductoryOffer={ isEligibleForFreeTrial }
			product={ siteProduct ?? product }
		/>
	);

	return (
		<>
			{ isEligibleForFreeTrial && (
				<div className="professional-email-price__trial-badge badge badge--info-green">
					{ freeTrialLabel }
				</div>
			) }

			<PriceBadge
				priceInformation={
					<PriceInformation
						domain={ domain }
						isDomainInCart={ isDomainInCart }
						product={ siteProduct ?? product }
					/>
				}
				price={ priceWithInterval }
			/>
		</>
	);
};

export default ProfessionalEmailPrice;
