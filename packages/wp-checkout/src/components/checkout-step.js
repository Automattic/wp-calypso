/* @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useLocalize } from '../lib/localize';
import { StepWrapper, StepTitle, StepHeader, StepNumber } from './basics';

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
		<StepWrapper collapsed={ collapsed } className={ joinClasses( classNames ) }>
			<CheckoutStepHeader
				stepNumber={ stepNumber }
				title={ title }
				collapsed={ collapsed }
				onEdit={ onEdit }
			/>
			{ children }
		</StepWrapper>
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
		<StepHeader className={ joinClasses( [ className, 'checkout-step__header' ] ) }>
			<Stepper isComplete={ collapsed }>{ stepNumber }</Stepper>
			<StepTitle className="checkout-step__title">{ title }</StepTitle>
			{ onEdit && collapsed && (
				<button className="checkout-step__edit" onClick={ onEdit }>
					{ localize( 'Edit' ) }
				</button>
			) }
		</StepHeader>
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
			<StepNumber
				className={ joinClasses( [
					className,
					'checkout-step__stepper',
					'checkout-step__stepper--is-complete',
				] ) }
			>
				{ children }
			</StepNumber>
		);
	}
	return (
		<StepNumber className={ joinClasses( [ className, 'checkout-step__stepper' ] ) }>
			{ children }
		</StepNumber>
	);
}

Stepper.propTypes = {
	className: PropTypes.string,
	isComplete: PropTypes.bool,
};
