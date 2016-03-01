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
	const classes = classNames( 'purchase-detail', {
		'is-placeholder': isPlaceholder
	} );

	let buttonElement;

	if ( buttonText || isPlaceholder ) {
		buttonElement = (
			<Button
				className="purchase-detail__button"
				href={ href }
				target={ target }
				primary>
				{ buttonText }
			</Button>
		);
	}

	return (
		<div className={ classes }>
			{ icon && <div className="purchase-detail__icon"><Gridicon icon={ icon } /></div> }

			<div className="purchase-detail__text">
				<h3 className="purchase-detail__title">{ title }</h3>
				<p className="purchase-detail__description">{ description }</p>
			</div>

			{ buttonElement }
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
