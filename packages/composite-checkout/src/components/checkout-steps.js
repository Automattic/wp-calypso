/**
 * External dependencies
 */
import React, { useState, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { useLocalize, sprintf } from '../lib/localize';
import joinClasses from '../lib/join-classes';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { useFormStatus } from '../lib/form-status';
import LoadingContent from './loading-content';
import CheckoutSubmitButton from './checkout-submit-button';

const debug = debugFactory( 'composite-checkout:checkout' );

const CheckoutStepDataContext = React.createContext();
const CheckoutSingleStepDataContext = React.createContext();

export function Checkout( { children, className } ) {
	const { formStatus } = useFormStatus();
	const localize = useLocalize();
	const [ activeStepNumber, setActiveStepNumber ] = useState( 1 );
	const [ stepCompleteStatus, setStepCompleteStatus ] = useState( {} );
	const [ totalSteps, setTotalSteps ] = useState( 0 );
	const isThereAnotherNumberedStep = activeStepNumber < totalSteps;

	if ( formStatus === 'loading' ) {
		return (
			<ContainerUI className={ joinClasses( [ className, 'composite-checkout' ] ) }>
				<MainContentUI
					className={ joinClasses( [ className, 'checkout__content' ] ) }
					isLastStepActive={ false }
				>
					<LoadingContent />
				</MainContentUI>
			</ContainerUI>
		);
	}

	return (
		<ContainerUI className={ joinClasses( [ className, 'composite-checkout' ] ) }>
			<CheckoutStepDataContext.Provider
				value={ {
					activeStepNumber,
					stepCompleteStatus,
					setActiveStepNumber,
					setStepCompleteStatus,
					setTotalSteps,
				} }
			>
				<MainContentUI
					className={ joinClasses( [ className, 'checkout__content' ] ) }
					isLastStepActive={ isThereAnotherNumberedStep }
				>
					{ children }

					<SubmittButtonWrapperUI isLastStepActive={ ! isThereAnotherNumberedStep }>
						<CheckoutErrorBoundary
							errorMessage={ localize( 'There was a problem with the submit button.' ) }
						>
							<CheckoutSubmitButton
								disabled={ isThereAnotherNumberedStep || formStatus !== 'ready' }
							/>
						</CheckoutErrorBoundary>
					</SubmittButtonWrapperUI>
				</MainContentUI>
			</CheckoutStepDataContext.Provider>
		</ContainerUI>
	);
}

export function CheckoutSteps( { children } ) {
	let stepNumber = 0;
	let nextStepNumber = 1;
	const totalSteps = React.Children.count( children );
	const {
		activeStepNumber,
		stepCompleteStatus,
		setActiveStepNumber,
		setStepCompleteStatus,
		setTotalSteps,
	} = useContext( CheckoutStepDataContext );

	useEffect( () => {
		setTotalSteps( totalSteps );
	}, [ totalSteps, setTotalSteps ] );

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
			<CheckoutSingleStepDataContext.Provider value={ stepNumber }>
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
			</CheckoutSingleStepDataContext.Provider>
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

const ContainerUI = styled.div`
	*:focus {
		outline: ${props => props.theme.colors.outline} solid 2px;
	}
`;

const MainContentUI = styled.div`
	background: ${props => props.theme.colors.surface};
	width: 100%;
	box-sizing: border-box;
	margin-bottom: ${props => ( props.isLastStepActive ? '89px' : 0 )};

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		border: 1px solid ${props => props.theme.colors.borderColorLight};
		margin: 32px auto;
		box-sizing: border-box;
		max-width: 556px;
	}
`;

const SubmittButtonWrapperUI = styled.div`
	background: ${props => props.theme.colors.background};
	padding: 24px;
	position: ${props => ( props.isLastStepActive ? 'fixed' : 'relative' )};
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	width: 100%;
	z-index: 10;
	border-top-width: ${props => ( props.isLastStepActive ? '1px' : '0' )};
	border-top-style: solid;
	border-top-color: ${props => props.theme.colors.borderColorLight};

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		position: relative;
		border: 0;
	}
`;

export function useIsStepActive() {
	const { activeStepNumber } = useContext( CheckoutStepDataContext );
	const stepNumber = useContext( CheckoutSingleStepDataContext );
	return activeStepNumber === stepNumber;
}

export function useIsStepComplete() {
	const { stepCompleteStatus } = useContext( CheckoutStepDataContext );
	const stepNumber = useContext( CheckoutSingleStepDataContext );
	return !! stepCompleteStatus[ stepNumber ];
}
