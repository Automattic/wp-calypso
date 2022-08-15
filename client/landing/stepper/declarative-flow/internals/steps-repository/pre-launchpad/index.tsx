import { StepContainer } from '@automattic/onboarding';
import { ReactElement, useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const PreLaunchpad: Step = function ( { navigation } ): ReactElement | null {
	useEffect( () => {
		setTimeout( () => navigation.goNext(), 5000 );
	}, [] );

	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName={ 'pre-launchpad' }
			isHorizontalLayout={ true }
			stepContent={
				<div className={ 'pre-launchpad' }>
					<h1 className="pre-launchpad__title">This is the pre-launchpad step</h1>
					<p>we are pretending to do things...</p>
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PreLaunchpad;
