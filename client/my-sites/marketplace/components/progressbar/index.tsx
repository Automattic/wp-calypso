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
}: {
	steps: TranslateResult[];
	currentStep: number;
} ): JSX.Element {
	const translate = useTranslate();
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

	/* translators: %(currentStep)s  Is the current step number, given that steps are set of counting numbers representing each step starting from 1, %(stepCount)s  Is the total number of steps, Eg: Step 1 of 3  */
	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: currentStep + 1, stepCount: steps.length },
	} );

	return (
		<Container>
			<Title className="progressbar__title wp-brand-font">{ steps[ currentStep ] }</Title>
			<StyledProgressBar
				value={ simulatedProgressPercentage }
				color="var( --studio-pink-50 )"
				compact
			/>
			<div>{ stepIndication }</div>
		</Container>
	);
}
