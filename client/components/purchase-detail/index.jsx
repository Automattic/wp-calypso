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
	isRequired,
	isSubmitting,
	onClick,
	requiredText,
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
				disabled={ isSubmitting }
				href={ href }
				onClick={ onClick }
				target={ target }
				primary>
				{ buttonText }
			</Button>
		);
	}

	return (
		<div className={ classes }>
			{ requiredText && (
				<div className="purchase-detail__required-notice">
					<em>{ requiredText }</em>
				</div>
			) }
			<div className="purchase-detail__content">
				{ icon && (
					<div className="purchase-detail__icon">
						<Gridicon icon={ icon } />
						{ isRequired && <Gridicon className="purchase-detail__notice-icon" icon="notice" /> }
					</div>
				) }

				<div className="purchase-detail__text">
					<h3 className="purchase-detail__title">{ title }</h3>
					<div className="purchase-detail__description">{ description }</div>
				</div>

				{ buttonElement }
			</div>
		</div>
	);
};

PurchaseDetail.propTypes = {
	buttonText: React.PropTypes.string,
	description: React.PropTypes.oneOfType( [
		React.PropTypes.array,
		React.PropTypes.string,
		React.PropTypes.object
	] ),
	href: React.PropTypes.string,
	icon: React.PropTypes.string,
	isPlaceholder: React.PropTypes.bool,
	isRequired: React.PropTypes.bool,
	isSubmitting: React.PropTypes.bool,
	onClick: React.PropTypes.func,
	requiredText: React.PropTypes.string,
	target: React.PropTypes.string,
	title: React.PropTypes.string
};

export default PurchaseDetail;
