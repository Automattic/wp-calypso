import { Step } from '@automattic/onboarding';
import { TranslateResult } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import Loading from 'calypso/components/loading';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import './style.scss';

const ACCELERATED_REFRESH_INTERVAL = 750;
const ACCELERATED_INCREMENT = 5;

export default function MarketplaceProgressBar( {
	steps,
	currentStep,
	additionalSteps,
	additionalStepsTimeout = 7000,
}: {
	steps: TranslateResult[];
	currentStep: number;
	additionalSteps?: TranslateResult[];
	additionalStepsTimeout?: number;
} ) {
	const [ stepValue, setStepValue ] = useState( steps[ currentStep ] );
	const [ additionalStepsTimeoutId, setAdditionalStepsTimeoutId ] = useState< NodeJS.Timeout >();
	const [ currentAdditionalSteps, setCurrentAdditionalSteps ] = useState< TranslateResult[] >( [] );
	const [ simulatedProgressPercentage, setSimulatedProgressPercentage ] = useState( 1 );
	useEffect( () => {
		const timeOutReference = setTimeout( () => {
			if (
				simulatedProgressPercentage <= 100 &&
				simulatedProgressPercentage / 100 <= ( currentStep + 1 ) / steps.length
			) {
				setSimulatedProgressPercentage(
					( previousPercentage ) => previousPercentage + ACCELERATED_INCREMENT
				);
			}
		}, ACCELERATED_REFRESH_INTERVAL );
		return () => clearTimeout( timeOutReference );
	}, [ simulatedProgressPercentage, steps, currentStep ] );

	useEffect( () => {
		setStepValue( steps[ currentStep ] );
		setAdditionalStepsTimeoutId( undefined );
	}, [ steps, currentStep ] );

	/**
	 * If the current list of additional steps is empty,
	 * restart it with a shuffled version of the additional steps
	 */
	useEffect( () => {
		if ( currentAdditionalSteps.length === 0 && additionalSteps?.length ) {
			const newAdditionalSteps = [ ...additionalSteps ];
			newAdditionalSteps.sort( () => 0.5 - Math.random() );
			setCurrentAdditionalSteps( newAdditionalSteps );
		}
	} );

	// Show additional messages in order when available
	useEffect( () => {
		function updateStepValueAfterTimeout() {
			if ( currentAdditionalSteps?.length ) {
				const timeoutId = setTimeout( () => {
					const newValue = currentAdditionalSteps.shift();

					if ( newValue && newValue !== stepValue ) {
						setStepValue( newValue );
					}

					updateStepValueAfterTimeout();
				}, additionalStepsTimeout );

				if ( additionalStepsTimeoutId ) {
					clearTimeout( additionalStepsTimeoutId );
				}
				setAdditionalStepsTimeoutId( timeoutId );
			}
		}

		updateStepValueAfterTimeout();

		return () => {
			if ( additionalStepsTimeoutId ) {
				clearTimeout( additionalStepsTimeoutId );
			}
		};
	}, [ additionalSteps, currentStep ] );

	if ( shouldUseStepContainerV2( getSignupCompleteFlowName() ) ) {
		return <Step.Loading title={ stepValue } progress={ simulatedProgressPercentage } />;
	}

	return (
		<Loading
			title={ stepValue }
			progress={ simulatedProgressPercentage }
			className="marketplace__loading"
		/>
	);
}
