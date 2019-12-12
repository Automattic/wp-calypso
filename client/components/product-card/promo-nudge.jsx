/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

const ProductCardPromoNudge = ( { badge, text } ) => {
	const className = classNames( 'product-card__promo-nudge', {
		'has-badge': !! badge,
	} );

	return (
		<div className={ className }>
			{ badge && <div className="product-card__promo-nudge-badge">{ badge }</div> }
			{ text && <h4 className="product-card__promo-nudge-text">{ text }</h4> }
		</div>
	);
};

ProductCardPromoNudge.propTypes = {
	badge: PropTypes.string,
	text: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] ),
};

export default ProductCardPromoNudge;
