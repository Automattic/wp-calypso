/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

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
	onClick = () => {},
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

	const renderBody = () => {
		if ( body ) {
			return(
				<div className="purchase-detail__body">{ body }</div>
			);
		}

		return(
			<div className="purchase-detail__body">
				{ buttonElement }
				{ info && <TipInfo info={ info } /> }
			</div>
		);
	};

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

				{ renderBody() }
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
