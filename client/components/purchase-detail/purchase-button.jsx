/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const PurchaseButton = ( {
	className = false,
	href,
	disabled,
	onClick = () => {},
	target,
	text,
	primary = true
} ) => {
	return (
		<Button
			className={ `${ className ? className + ' ' : '' }purchase-detail__button` }
			disabled={ disabled }
			href={ href }
			onClick={ onClick }
			target={ target }
			primary={ primary }
		>
			{ text }
		</Button>
	);
};

PurchaseButton.propTypes = {
	className: PropTypes.string,
	href: PropTypes.string,
	disabled: PropTypes.bool,
	onClick: PropTypes.func,
	target: PropTypes.string,
	text: PropTypes.string,
	primary: PropTypes.bool
};

export default PurchaseButton;
