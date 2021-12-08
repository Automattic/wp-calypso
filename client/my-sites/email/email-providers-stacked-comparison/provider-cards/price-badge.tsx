import React, { FunctionComponent, ReactElement } from 'react';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';

type PriceBadgeProps = {
	additionalPriceInformationComponent?: ReactElement | null;
	className: string;
	priceComponent: ReactElement;
};

const PriceBadge: FunctionComponent< PriceBadgeProps > = ( props ) => {
	const { additionalPriceInformationComponent, className, priceComponent } = props;

	const priceBadgeClass = `${ className }__price-badge`;

	const additionalPriceInformationClass = `${ className }__provider-additional-price-information`;

	return (
		<div className={ priceBadgeClass }>
			<PromoCardPrice
				formattedPrice={ priceComponent }
				additionalPriceInformation={
					<span className={ additionalPriceInformationClass }>
						{ additionalPriceInformationComponent }
					</span>
				}
			/>
		</div>
	);
};

export default PriceBadge;
