/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { ProgressBar } from '@automattic/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';

const Container = styled.div`
	text-align: center;
`;
const StyledProgressBar = styled( ProgressBar )`
	margin: 20px 0px;
`;

const Title = styled.h1`
	font-size: 2rem;
`;

export function resolveStep(
	steps: TranslateResult[],
	currentPercentage: number
): TranslateResult {
	const totalSteps = steps.length;
	const perStepPercentage = 100 / totalSteps;
	const quotient = Math.floor( currentPercentage / perStepPercentage );

	if ( currentPercentage <= perStepPercentage ) {
		return steps[ 0 ];
	} else if ( currentPercentage >= perStepPercentage * totalSteps ) {
		return steps[ steps.length - 1 ];
	}
	return steps[ quotient ];
}

export default function SimulatedProgressbar( {
	steps,
}: {
	steps: TranslateResult[];
} ): JSX.Element {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( steps[ 0 ] );
	const [ simulatedProgressPercentage, setSimulatedProgressPercentage ] = useState( 1 );

	const SIMULATION_REFRESH_INTERVAL = 2000;
	const INCREMENTED_PERCENTAGE_SIZE_ON_STEP = 6;
	const MAX_PERCENTAGE_SIMULATED = 100 - INCREMENTED_PERCENTAGE_SIZE_ON_STEP * 2;
	useEffect( () => {
		setTimeout(
			() => {
				if ( simulatedProgressPercentage < MAX_PERCENTAGE_SIMULATED ) {
					setSimulatedProgressPercentage(
						( previousPercentage ) => previousPercentage + INCREMENTED_PERCENTAGE_SIZE_ON_STEP
					);
				}
			},

			SIMULATION_REFRESH_INTERVAL
		);
	}, [ MAX_PERCENTAGE_SIMULATED, simulatedProgressPercentage ] );

	const newStep = resolveStep( steps, simulatedProgressPercentage );
	if ( newStep !== currentStep ) setCurrentStep( newStep );

	const currentNumericStep = steps.indexOf( currentStep ) + 1;

	/* translators: %(currentStep)s  Is the current step number, given that steps are set of counting numbers representing each step starting from 1, %(stepCount)s  Is the total number of steps, Eg: Step 1 of 3  */
	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: currentNumericStep, stepCount: steps.length },
	} );

	return (
		<Container>
			<Title className="simulated-progressbar__title wp-brand-font">{ currentStep }</Title>
			<StyledProgressBar value={ simulatedProgressPercentage } color="#C9356E" compact />
			<div>{ stepIndication }</div>
		</Container>
	);
}
