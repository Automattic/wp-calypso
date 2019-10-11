/* @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import { useLocalize } from './localize';

export default function CheckoutStep( {
	className,
	stepNumber,
	title,
	onEdit,
	collapsed,
	children,
} ) {
	const classNames = collapsed
		? [ className, 'checkout-step', 'checkout-step--is-collapsed' ]
		: [ className, 'checkout-step' ];
	return (
		<div className={ joinClasses( classNames ) }>
			<CheckoutStepHeader
				stepNumber={ stepNumber }
				title={ title }
				collapsed={ collapsed }
				onEdit={ onEdit }
			/>
			{ children }
		</div>
	);
}

CheckoutStep.propTypes = {
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
};

function CheckoutStepHeader( { className, stepNumber, title, collapsed, onEdit } ) {
	const localize = useLocalize();
	return (
		<div className={ joinClasses( [ className, 'checkout-step__header' ] ) }>
			<Stepper isComplete={ collapsed }>{ stepNumber }</Stepper>
			<span className="checkout-step__title">{ title }</span>
			{ onEdit && collapsed && (
				<button className="checkout-step__edit" onClick={ onEdit }>
					{ localize( 'Edit' ) }
				</button>
			) }
		</div>
	);
}

CheckoutStepHeader.propTypes = {
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	collapsed: PropTypes.bool,
	onEdit: PropTypes.func,
};

function Stepper( { isComplete, className, children } ) {
	if ( isComplete ) {
		return (
			<span
				className={ joinClasses( [
					className,
					'checkout-step__stepper',
					'checkout-step__stepper--is-complete',
				] ) }
			>
				{ children }
			</span>
		);
	}
	return (
		<span className={ joinClasses( [ className, 'checkout-step__stepper' ] ) }>{ children }</span>
	);
}

Stepper.propTypes = {
	className: PropTypes.string,
	isComplete: PropTypes.bool,
};
