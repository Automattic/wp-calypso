/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ProductCardPromoNudge = ( { badgeText, text } ) => {
	const className = classNames( 'product-card__promo-nudge', {
		'has-badge': !! badgeText,
	} );

	return (
		<div className={ className }>
			{ badgeText && <div className="product-card__promo-nudge-badge">{ badgeText }</div> }
			{ text && <h4 className="product-card__promo-nudge-text">{ text }</h4> }
		</div>
	);
};

ProductCardPromoNudge.propTypes = {
	badgeText: PropTypes.string,
	text: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] ),
};

export default ProductCardPromoNudge;
