import { StepContainer } from '@automattic/onboarding';
import { ReactElement } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const Subscribers: Step = function ( { navigation } ): ReactElement | null {
	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName={ 'subscribers' }
			flowName={ 'newsletter' }
			isHorizontalLayout={ true }
			stepContent={
				<div className={ 'subscribers' }>
					<h1 className="subscribers__title">This is the subscribers step</h1>
					<p>Content here...</p>
					<button onClick={ () => navigation.goNext() }>Go to the next step</button>
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
