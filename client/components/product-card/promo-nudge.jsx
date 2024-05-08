import clsx from 'clsx';
import PropTypes from 'prop-types';

const ProductCardPromoNudge = ( { badgeText, text } ) => {
	const className = clsx( 'product-card__promo-nudge', {
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
	text: PropTypes.node,
};

export default ProductCardPromoNudge;
