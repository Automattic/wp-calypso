/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';

export interface Props {
	formattedPrice?: string | TranslateResult;
	billingInterval?: string | TranslateResult;
	discount?: string | TranslateResult;
}

const PromoCardPrice: FunctionComponent< Props > = ( {
	formattedPrice,
	billingInterval,
	discount,
} ) => {
	const translate = useTranslate();

	if ( ! formattedPrice ) {
		return (
			<span className="promo-card__price">
				<span className="price__cost">{ translate( 'Free' ) }</span>
			</span>
		);
	}

	const costClassNames = classnames( 'price__cost', {
		price__discounted: !! discount,
	} );

	const interval = billingInterval ? (
		<span className="price__interval">{ billingInterval }</span>
	) : null;

	const discountSpan = discount ? <span className="price__discount">{ discount }</span> : null;

	return (
		<div className="promo-card__price">
			<span className={ costClassNames }>{ formattedPrice }</span>
			{ interval }
			{ discountSpan }
		</div>
	);
};

export default PromoCardPrice;
