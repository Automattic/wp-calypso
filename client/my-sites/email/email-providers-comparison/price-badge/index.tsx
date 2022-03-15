import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import type { ReactElement } from 'react';

import './style.scss';

type PriceBadgeProps = {
	additionalPriceInformation?: ReactElement | null;
	price: ReactElement;
};

const PriceBadge = ( { additionalPriceInformation, price }: PriceBadgeProps ): ReactElement => (
	<div className="price-badge">
		<PromoCardPrice
			formattedPrice={ price }
			additionalPriceInformation={ <span>{ additionalPriceInformation }</span> }
		/>
	</div>
);

export default PriceBadge;
