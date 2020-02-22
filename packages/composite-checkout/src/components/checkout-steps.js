/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutErrorBoundary from './checkout-error-boundary';
import { useFormStatus } from '../lib/form-status';

const debug = debugFactory( 'composite-checkout:checkout' );

export function Checkout( { children } ) {
	return children;
}

export function CheckoutSteps( { children } ) {
	const [ activeStepNumber, setActiveStepNumber ] = useState( 1 );
	const [ stepCompleteStatus, setStepCompleteStatus ] = useState( {} );
	let stepNumber = 0;
	let nextStepNumber = 1;
	const totalSteps = React.Children.count( children );

	return React.Children.map( children, child => {
		stepNumber = nextStepNumber;
		nextStepNumber = stepNumber === totalSteps ? null : stepNumber + 1;
		const isStepActive = activeStepNumber === stepNumber;
		const isStepComplete = !! stepCompleteStatus[ stepNumber ];
		return React.cloneElement( child, {
			stepNumber,
			nextStepNumber,
			isStepActive,
			isStepComplete,
			setActiveStepNumber,
			setStepCompleteStatus: newStatus =>
				setStepCompleteStatus( { ...stepCompleteStatus, [ stepNumber ]: newStatus } ),
		} );
	} );
}

export function CheckoutStep( {
	children,
	title,
	stepId,
	isComplete,
	stepNumber,
	nextStepNumber,
	isStepActive,
	isStepComplete,
	setActiveStepNumber,
	setStepCompleteStatus,
} ) {
	const { setFormPending, setFormReady } = useFormStatus();
	const goToThisStep = () => setActiveStepNumber( stepNumber );
	const goToNextStep = () => {
		const completeResult = isComplete();
		if ( completeResult.then ) {
			setFormPending();
			completeResult.then( delayedCompleteResult => {
				setStepCompleteStatus( delayedCompleteResult );
				if ( delayedCompleteResult ) {
					setActiveStepNumber( nextStepNumber );
				}
				setFormReady();
			} );
			return;
		}
		setStepCompleteStatus( !! completeResult );
		if ( completeResult ) {
			setActiveStepNumber( nextStepNumber );
		}
		setFormReady();
	};

	return (
		<CheckoutErrorBoundary errorMessage="There was an error with this step">
			<CheckoutStepHeaderUI>
				{ isStepComplete ? (
					<CheckoutStepCompleteBadge />
				) : (
					<CheckoutStepBadgeUI>{ stepNumber }</CheckoutStepBadgeUI>
				) }
				<CheckoutStepTitleUI>{ title }</CheckoutStepTitleUI>
				{ isStepComplete ? <CheckoutStepEditButton onClick={ goToThisStep } /> : null }
			</CheckoutStepHeaderUI>
			{ children }
			{ nextStepNumber > 0 ? <CheckoutStepContinueButton onClick={ goToNextStep } /> : null }
		</CheckoutErrorBoundary>
	);
}

const CheckoutStepHeaderUI = styled.div`
	border: 1px solid orange;
`;

const CheckoutStepBadgeUI = styled.div`
	width: 10px;
	height: 10px;
	background: green;
`;

const CheckoutStepTitleUI = styled.div`
	border: 1px dotted green;
`;

const CheckoutStepCompleteBadge = styled.div`
	width: 10px;
	height: 10px;
	background: green;
`;

function CheckoutStepEditButton( { onClick } ) {
	return <button onClick={ onClick }>Edit</button>;
}

function CheckoutStepContinueButton( { onClick } ) {
	return <button onClick={ onClick }>Continue</button>;
}
