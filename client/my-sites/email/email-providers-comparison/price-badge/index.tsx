import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import type { ReactElement } from 'react';

import './style.scss';

type PriceBadgeProps = {
	additionalPriceInformationComponent?: ReactElement | null;
	priceComponent: ReactElement;
};

const PriceBadge = ( {
	additionalPriceInformationComponent,
	priceComponent,
}: PriceBadgeProps ): ReactElement => (
	<div className="price-badge">
		<PromoCardPrice
			formattedPrice={ priceComponent }
			additionalPriceInformation={ <span>{ additionalPriceInformationComponent }</span> }
		/>
	</div>
);

export default PriceBadge;
