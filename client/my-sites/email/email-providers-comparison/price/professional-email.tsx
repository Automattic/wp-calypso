/* eslint-disable wpcalypso/jsx-classname-namespace */

import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactElement } from 'react';

import './style.scss';

const getTitanProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? TITAN_MAIL_MONTHLY_SLUG
		: TITAN_MAIL_YEARLY_SLUG;
};

type ProfessionalEmailPriceProps = {
	domain: SiteDomain | undefined;
	intervalLength: IntervalLength;
};

const ProfessionalEmailPrice = ( {
	domain,
	intervalLength,
}: ProfessionalEmailPriceProps ): ReactElement => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const productSlug = getTitanProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const priceWithInterval = (
		<PriceWithInterval
			cost={ product?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ false }
			intervalLength={ intervalLength }
		/>
	);

	return (
		<>
			{ isDomainEligibleForTitanFreeTrial( domain ) && (
				<div className="professional-email-price__trial-badge badge badge--info-green">
					{ translate( '3 months free' ) }
				</div>
			) }

			<PriceBadge price={ priceWithInterval } />
		</>
	);
};

export default ProfessionalEmailPrice;
