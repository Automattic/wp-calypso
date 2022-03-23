import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import type { ReactElement } from 'react';

import './style.scss';

type PriceBadgeProps = {
	price: ReactElement;
	priceInformation?: ReactElement;
};

const PriceBadge = ( { price, priceInformation }: PriceBadgeProps ): ReactElement => (
	<div className="price-badge">
		<PromoCardPrice formattedPrice={ price } additionalPriceInformation={ priceInformation } />
	</div>
);

export default PriceBadge;
