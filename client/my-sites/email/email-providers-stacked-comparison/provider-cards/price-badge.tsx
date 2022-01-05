import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import type { ReactElement } from 'react';

type PriceBadgeProps = {
	additionalPriceInformationComponent?: ReactElement | null;
	priceComponent: ReactElement;
};

const PriceBadge: ReactElement< PriceBadgeProps > | null = ( props ) => {
	const { additionalPriceInformationComponent, priceComponent } = props;

	return (
		<div className="provider-cards__price-badge">
			<PromoCardPrice
				formattedPrice={ priceComponent }
				additionalPriceInformation={
					<span className="provider-cards__provider-additional-price-information">
						{ additionalPriceInformationComponent }
					</span>
				}
			/>
		</div>
	);
};

export default PriceBadge;
