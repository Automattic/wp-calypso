import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

const Container = styled.div`
	text-align: center;
`;
const StyledProgressBar = styled( ProgressBar )`
	margin: 20px 0;
`;

const Title = styled.h1`
	font-size: 2rem;
`;

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
	const translate = useTranslate();
	const [ stepValue, setStepValue ] = useState( steps[ currentStep ] );
	const [ additionalStepsTimeoutId, setAdditionalStepsTimeoutId ] = useState< NodeJS.Timeout >();
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

	// Show additional messages when available
	useEffect( () => {
		function updateStepValueAfterTimeout() {
			if ( additionalSteps?.length ) {
				const timeoutId = setTimeout( () => {
					const randomIndex = Math.floor( Math.random() * additionalSteps.length );
					const newValue = additionalSteps[ randomIndex ];

					if ( newValue !== stepValue ) {
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

	/* translators: %(currentStep)s  Is the current step number, given that steps are set of counting numbers representing each step starting from 1, %(stepCount)s  Is the total number of steps, Eg: Step 1 of 3  */
	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: currentStep + 1, stepCount: steps.length },
	} );

	return (
		<Container>
			<Title className="progressbar__title wp-brand-font">{ stepValue }</Title>
			<StyledProgressBar
				value={ simulatedProgressPercentage }
				color="var( --studio-pink-50 )"
				compact
			/>
			<div>{ stepIndication }</div>
		</Container>
	);
}
