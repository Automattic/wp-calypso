/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';

const PurchaseDetail = ( {
	buttonText,
	description,
	href,
	icon,
	isPlaceholder,
	target,
	title
} ) => {
	const classes = classNames( 'checkout-thank-you__purchase-detail', {
		'is-placeholder': isPlaceholder
	} );

	return (
		<div className={ classes }>
			{ icon && <div className="checkout-thank-you__purchase-detail-icon"><Gridicon icon={ icon } /></div> }
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
	buttonText: React.PropTypes.string,
	description: React.PropTypes.oneOfType( [
		React.PropTypes.array,
		React.PropTypes.string,
	] ),
	href: React.PropTypes.string,
	icon: React.PropTypes.string,
	isPlaceholder: React.PropTypes.bool,
	target: React.PropTypes.string,
	title: React.PropTypes.string
};

export default PurchaseDetail;
