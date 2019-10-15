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
import { StepWrapper, StepTitle, StepHeader, StepNumber, StepContent } from './basics';

export default function CheckoutStep( {
	className,
	stepNumber,
	title,
	onEdit,
	isActive,
	isComplete,
	children,
} ) {
	const classNames = [
		className,
		'checkout-step',
		...( isActive ? [ 'checkout-step--is-active' ] : [] ),
		...( isComplete ? [ 'checkout-step--is-complete' ] : [] ),
	];
	return (
		<StepWrapper
			isActive={ isActive }
			isComplete={ isComplete }
			className={ joinClasses( classNames ) }
		>
			<CheckoutStepHeader
				stepNumber={ stepNumber }
				title={ title }
				isActive={ isActive }
				isComplete={ isComplete }
				onEdit={ onEdit }
			/>
			<StepContent>{ children }</StepContent>
		</StepWrapper>
	);
}

CheckoutStep.propTypes = {
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
};

function CheckoutStepHeader( { className, stepNumber, title, isActive, isComplete, onEdit } ) {
	const localize = useLocalize();
	return (
		<StepHeader className={ joinClasses( [ className, 'checkout-step__header' ] ) }>
			<Stepper isComplete={ isComplete } isActive={ isActive }>
				{ stepNumber }
			</Stepper>
			<StepTitle className="checkout-step__title">{ title }</StepTitle>
			{ onEdit && isComplete && ! isActive && (
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
	isActive: PropTypes.bool,
	isComplete: PropTypes.bool,
	onEdit: PropTypes.func,
};

function Stepper( { isComplete, isActive, className, children } ) {
	return (
		<StepNumber
			isComplete={ isComplete }
			isActive={ isActive }
			className={ joinClasses( [ className, 'checkout-step__stepper' ] ) }
		>
			{ children }
		</StepNumber>
	);
}

Stepper.propTypes = {
	className: PropTypes.string,
	isComplete: PropTypes.bool,
	isActive: PropTypes.bool,
};
