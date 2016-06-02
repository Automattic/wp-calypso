/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import PurchaseButton from './purchase-button';
import TipInfo from './tip-info';

const PurchaseDetail = ( {
	body,
	buttonText,
	description,
	href,
	icon,
	id,
	info,
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
			<PurchaseButton
				disabled={ isSubmitting }
				href={ href }
				onClick={ onClick }
				target={ target }
				text={ buttonText } />
		);
	}

	return (
		<div className={ classes } id={ id || null }>
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

				{ body
					? <div className="purchase-detail__body">{ body }</div>
					: <div className="purchase-detail__body">
						{ buttonElement }
						{ info && <TipInfo info={ info } /> }
					</div>
				}
			</div>
		</div>
	);
};

PurchaseDetail.propTypes = {
	buttonText: PropTypes.string,
	description: PropTypes.oneOfType( [
		PropTypes.array,
		PropTypes.string,
		PropTypes.object
	] ),
	href: PropTypes.string,
	icon: PropTypes.string,
	isPlaceholder: PropTypes.bool,
	isRequired: PropTypes.bool,
	isSubmitting: PropTypes.bool,
	onClick: PropTypes.func,
	requiredText: PropTypes.string,
	target: PropTypes.string,
	title: PropTypes.string
};

PurchaseDetail.defaultProps = {
	onClick: () => {},
};

export default PurchaseDetail;
