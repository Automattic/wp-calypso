import { StepContainer } from '@automattic/onboarding';
import { ReactElement, useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const ProcessingFake: Step = function ( { navigation } ): ReactElement | null {
	useEffect( () => {
		setTimeout( () => navigation.goNext(), 5000 );
	}, [] );

	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName={ 'processing-fake' }
			flowName={ 'newsletter' }
			isHorizontalLayout={ true }
			stepContent={
				<div className={ 'processing-fake' }>
					<h1 className="processing-fake__title">This is the fake processing step</h1>
					<p>we are pretending to do things...</p>
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ProcessingFake;
