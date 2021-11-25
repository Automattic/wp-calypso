import classnames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, ReactElement } from 'react';

export interface Props {
	/** Should be of the format: <span>$price</span> /interval, e.g. <span>$1</span> /year */
	formattedPrice?: string | TranslateResult;
	discount?: string | TranslateResult;
	additionalPriceInformation?: string | TranslateResult | ReactElement;
}

const PromoCardPrice: FunctionComponent< Props > = ( {
	formattedPrice,
	discount,
	additionalPriceInformation = null,
} ) => {
	const translate = useTranslate();

	if ( ! formattedPrice ) {
		formattedPrice = <span>{ translate( 'Free' ) }</span>;
	}

	const costClassNames = classnames( 'price__cost', {
		price__discounted: !! discount,
	} );

	const discountSpan = discount ? <span className="price__discount">{ discount }</span> : null;

	return (
		<div className="promo-card__price">
			<span className={ costClassNames }>{ formattedPrice }</span>
			{ discountSpan }
			{ additionalPriceInformation }
		</div>
	);
};

export default PromoCardPrice;
