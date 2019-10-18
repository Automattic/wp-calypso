/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ProductCardAction = ( { intro, label, onClick } ) => {
	if ( ! label ) {
		return null;
	}

	return (
		<div className="product-card__action">
			{ intro && <h4 className="product-card__action-intro">{ intro }</h4> }
			<Button className="product-card__action-button" onClick={ onClick } primary>
				{ label }
			</Button>
		</div>
	);
};

ProductCardAction.propTypes = {
	intro: PropTypes.string,
	label: PropTypes.string,
	onClick: PropTypes.func,
};

export default ProductCardAction;
