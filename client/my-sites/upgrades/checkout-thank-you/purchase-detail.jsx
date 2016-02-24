/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const PurchaseDetail = ( {
	additionalClass,
	buttonText,
	description,
	href,
	isPlaceholder,
	target,
	title
} ) => {
	const classes = classNames( 'checkout-thank-you__purchase-detail', additionalClass, {
		'is-placeholder': isPlaceholder
	} );

	return (
		<div className={ classes }>
			<div className="checkout-thank-you__purchase-detail-text">
				<h3 className="checkout-thank-you__purchase-detail-title">{ title }</h3>
				<p className="checkout-thank-you__purchase-detail-description">{ description }</p>
			</div>
			<Button
				className="checkout-thank-you__purchase-detail-button"
				href={ href }
				target={ target }
				primary>
				{ buttonText }
			</Button>
		</div>
	);
};

PurchaseDetail.propTypes = {
	additionalClass: React.PropTypes.string,
	buttonText: React.PropTypes.string,
	description: React.PropTypes.oneOfType( [
		React.PropTypes.array,
		React.PropTypes.string,
	] ),
	href: React.PropTypes.string,
	isPlaceholder: React.PropTypes.bool,
	target: React.PropTypes.string,
	title: React.PropTypes.string
};

export default PurchaseDetail;
