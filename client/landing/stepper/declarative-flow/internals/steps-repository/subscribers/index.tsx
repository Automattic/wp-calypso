import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const Subscribers: Step = function ( { navigation } ): ReactElement | null {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { setPendingAction, setProgressTitle, setProgress } = useDispatch( ONBOARD_STORE );

	const handleSubmit = () => {
		const navigateTo = 'launchpad';
		const providedDependencies = { navigateTo };

		setPendingAction( async () => {
			setProgressTitle( __( 'Creating your Newsletter' ) );
			setProgress( 0.3 );
			await wait( 1500 );
			setProgress( 1 );
			setProgressTitle( __( 'Preparing Next Steps' ) );
			await wait( 2000 );
		} );

		submit?.( providedDependencies, navigateTo );
	};

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
					<button onClick={ handleSubmit }>Go to the next step</button>
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
