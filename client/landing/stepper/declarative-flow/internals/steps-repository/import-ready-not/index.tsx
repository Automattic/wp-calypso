import React from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ReadyNotStep } from 'calypso/signup/steps/import/ready';
import { ImportWrapper } from '../import';
import { generateStepPath } from '../import/helper';
import './style.scss';

const ImportReadyNot: Step = function ImportStep( props ) {
	const { navigation } = props;

	return (
		<ImportWrapper { ...props }>
			<ReadyNotStep
				goToStep={ ( step, section ) => navigation.goToStep?.( generateStepPath( step, section ) ) }
				recordTracksEvent={ recordTracksEvent }
			/>
		</ImportWrapper>
	);
};

export default ImportReadyNot;
