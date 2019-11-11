/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ProductCardAction = ( { intro, label, onClick, isPrimary, href } ) => (
	<div className="product-card__action">
		{ intro && <h4 className="product-card__action-intro">{ intro }</h4> }
		<Button
			className="product-card__action-button"
			href={ href }
			onClick={ onClick }
			primary={ isPrimary }
		>
			{ label }
		</Button>
	</div>
);

ProductCardAction.propTypes = {
	intro: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	href: PropTypes.string,
	primary: PropTypes.boolean,
};

ProductCardAction.defaultProps = {
	href: null,
	onClick: noop,
	isPrimary: true,
};

export default ProductCardAction;
