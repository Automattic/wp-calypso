import React from 'react';
import { ReadyNotStep } from 'calypso/blocks/import/ready';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ImportWrapper } from '../import';
import { generateStepPath } from '../import/helper';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const ImportReadyNot: Step< {
	submits: {
		platform: ImporterPlatform;
		url: string;
	};
} > = function ImportStep( props ) {
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
