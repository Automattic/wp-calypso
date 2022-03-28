/* eslint-disable wpcalypso/jsx-classname-namespace */

import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import PriceInformation from 'calypso/my-sites/email/email-providers-comparison/price/price-information';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

import './style.scss';

const getTitanProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? TITAN_MAIL_MONTHLY_SLUG
		: TITAN_MAIL_YEARLY_SLUG;
};

type ProfessionalEmailPriceProps = {
	domain?: SiteDomain;
	intervalLength: IntervalLength;
	isDomainInCart?: boolean;
};

const ProfessionalEmailPrice = ( {
	domain,
	intervalLength,
	isDomainInCart = false,
}: ProfessionalEmailPriceProps ): JSX.Element | null => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const productSlug = getTitanProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	const isEligibleForFreeTrial = isDomainInCart || isDomainEligibleForTitanFreeTrial( domain );

	const priceWithInterval = (
		<PriceWithInterval
			currencyCode={ currencyCode ?? '' }
			intervalLength={ intervalLength }
			isEligibleForFreeTrial={ isEligibleForFreeTrial }
			product={ product }
		/>
	);

	return (
		<>
			{ isEligibleForFreeTrial && (
				<div className="professional-email-price__trial-badge badge badge--info-green">
					{ translate( '3 months free' ) }
				</div>
			) }

			<PriceBadge
				priceInformation={ <PriceInformation domain={ domain } product={ product } /> }
				price={ priceWithInterval }
			/>
		</>
	);
};

export default ProfessionalEmailPrice;
