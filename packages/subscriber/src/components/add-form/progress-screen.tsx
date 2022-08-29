/* eslint-disable wpcalypso/jsx-classname-namespace */
import { ProgressBar } from '@automattic/components';
import { Progress, SubTitle, Title } from '@automattic/onboarding';
import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { IMPORT_PROGRESS_SIMULATION_DURATION } from '../../config';

export const AddSubscribersProgressScreen: FunctionComponent = () => {
	const STEP_NUMBER = 3;
	const [ progress, setProgress ] = useState( 17 );
	const progressRef = useRef( progress );

	useEffect( () => {
		progressRef.current = progress;
	}, [ progress ] );

	useEffect( () => {
		const interval = setInterval( () => {
			setProgress( progressRef.current + 100 / STEP_NUMBER );
		}, IMPORT_PROGRESS_SIMULATION_DURATION / STEP_NUMBER );
		return () => clearInterval( interval );
	}, [] );

	return (
		<div className={ 'add-subscriber__progress--container' }>
			{ progress < 100 && <Title>Importing subscribers</Title> }
			{ progress >= 100 && <Title>Done!</Title> }

			<Progress>
				<ProgressBar value={ progress } compact={ true } />
			</Progress>

			{ progress < 100 && <SubTitle>This should be quick.</SubTitle> }
			{ progress >= 100 && <SubTitle>Successfully added your readers.</SubTitle> }
		</div>
	);
};
