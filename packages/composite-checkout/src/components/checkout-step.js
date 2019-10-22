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
import { StepWrapper, StepTitle, StepHeader, StepNumber, StepContent, StepSummary } from './basics';

export default function CheckoutStep( {
	className,
	stepNumber,
	title,
	onEdit,
	isActive,
	isComplete,
	finalStep,
	stepSummary,
	stepContent,
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
			finalStep={ finalStep }
		>
			<CheckoutStepHeader
				stepNumber={ stepNumber }
				title={ title }
				isActive={ isActive }
				isComplete={ isComplete }
				onEdit={ onEdit }
			/>
			<StepContent className="checkout-step__content" isVisible={ isActive }>
				{ stepContent }
			</StepContent>
			{ stepSummary && (
				<StepSummary className="checkout-step__summary" isVisible={ ! isActive }>
					{ stepSummary }
				</StepSummary>
			) }
		</StepWrapper>
	);
}

CheckoutStep.propTypes = {
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	finalStep: PropTypes.bool,
	stepSummary: PropTypes.node,
	stepContent: PropTypes.node.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};

function CheckoutStepHeader( { className, stepNumber, title, isActive, isComplete, onEdit } ) {
	const localize = useLocalize();
	return (
		<StepHeader className={ joinClasses( [ className, 'checkout-step__header' ] ) }>
			<Stepper isComplete={ isComplete } isActive={ isActive }>
				{ isComplete ? <CheckIcon /> : stepNumber }
			</Stepper>
			<StepTitle className="checkout-step__title" isActive={ isActive }>
				{ title }
			</StepTitle>
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

function CheckIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<mask
				id="mask1"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="2"
				y="4"
				width="16"
				height="12"
			>
				<path
					d="M7.32916 13.2292L3.85416 9.75417L2.67083 10.9292L7.32916 15.5875L17.3292 5.58751L16.1542 4.41251L7.32916 13.2292Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#mask1)">
				<rect width="20" height="20" fill="#008A20" />
			</g>
		</svg>
	);
}
