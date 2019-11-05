/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ProductCardAction = ( { intro, label, onClick } ) => (
	<div className="product-card__action">
		{ intro && <h4 className="product-card__action-intro">{ intro }</h4> }
		<Button className="product-card__action-button" onClick={ onClick } primary>
			{ label }
		</Button>
	</div>
);

ProductCardAction.propTypes = {
	intro: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func,
};

export default ProductCardAction;
