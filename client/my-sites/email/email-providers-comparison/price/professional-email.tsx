/* eslint-disable wpcalypso/jsx-classname-namespace */

import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { PriceAndBadgeWithOfferAndDiscountTerms } from 'calypso/my-sites/email/email-providers-comparison/price/price-and-badge-with-offer-and-discount-terms';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const getTitanProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? TITAN_MAIL_MONTHLY_SLUG
		: TITAN_MAIL_YEARLY_SLUG;
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
	const productSlug = getTitanProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	return (
		<PriceAndBadgeWithOfferAndDiscountTerms
			domain={ domain }
			intervalLength={ intervalLength }
			isDomainInCart={ isDomainInCart }
			product={ product }
		/>
	);
};

export default ProfessionalEmailPrice;
