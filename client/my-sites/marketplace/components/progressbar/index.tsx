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

const SIMULATION_REFRESH_INTERVAL = 2000;
const INCREMENTED_PERCENTAGE_SIZE_ON_STEP = 2;
const MAX_PERCENTAGE_SIMULATED = 100 - INCREMENTED_PERCENTAGE_SIZE_ON_STEP * 2;

/**
 * Accelerated parameters
 */
const ACCELERATED_REFRESH_INTERVAL = 1000;
const ACCELERATED_INCREMENT = 5;

export default function MarketplaceProgressBar( {
	steps,
	currentStep,
	accelerateCompletion,
}: {
	steps: TranslateResult[];
	currentStep: number;
	accelerateCompletion: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const [ simulatedProgressPercentage, setSimulatedProgressPercentage ] = useState( 1 );
	console.log( currentStep );
	useEffect( () => {
		const timeOutReference = setTimeout(
			() => {
				if ( ! accelerateCompletion && simulatedProgressPercentage <= MAX_PERCENTAGE_SIMULATED ) {
					setSimulatedProgressPercentage(
						( previousPercentage ) => previousPercentage + INCREMENTED_PERCENTAGE_SIZE_ON_STEP
					);
				} else if ( accelerateCompletion && simulatedProgressPercentage <= 100 ) {
					setSimulatedProgressPercentage(
						( previousPercentage ) => previousPercentage + ACCELERATED_INCREMENT
					);
				}
			},

			accelerateCompletion ? ACCELERATED_REFRESH_INTERVAL : SIMULATION_REFRESH_INTERVAL
		);
		return () => clearTimeout( timeOutReference );
	}, [ accelerateCompletion, simulatedProgressPercentage ] );

	/* translators: %(currentStep)s  Is the current step number, given that steps are set of counting numbers representing each step starting from 1, %(stepCount)s  Is the total number of steps, Eg: Step 1 of 3  */
	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: currentStep + 1, stepCount: steps.length },
	} );

	return (
		<Container>
			<Title className="simulated-progressbar__title wp-brand-font">{ steps[ currentStep ] }</Title>
			<StyledProgressBar value={ simulatedProgressPercentage } color="#C9356E" compact />
			<div>{ stepIndication }</div>
		</Container>
	);
}
