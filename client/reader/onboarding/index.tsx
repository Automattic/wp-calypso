import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem, Task } from '@automattic/launchpad';
import { translate } from 'i18n-calypso';
import React, { useState } from 'react';
import { READER_ONBOARDING_PREFERENCE_KEY } from 'calypso/reader/onboarding/constants';
import InterestsModal from 'calypso/reader/onboarding/interests-modal';
import SubscribeModal from 'calypso/reader/onboarding/subscribe-modal';
import { useSelector } from 'calypso/state';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

import './style.scss';

const ReaderOnboarding = () => {
	const [ isInterestsModalOpen, setIsInterestsModalOpen ] = useState( false );
	const [ isDiscoverModalOpen, setIsDiscoverModalOpen ] = useState( false );
	const followedTags = useSelector( getReaderFollowedTags );
	const hasCompletedOnboarding = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_PREFERENCE_KEY )
	);
	const preferencesLoaded = useSelector( hasReceivedRemotePreferences );

	// Don't render anything until preferences are loaded or if onboarding is completed.
	if ( ! preferencesLoaded || hasCompletedOnboarding ) {
		return null;
	}

	const handleInterestsContinue = () => {
		setIsInterestsModalOpen( false );
		setIsDiscoverModalOpen( true );
	};

	const itemClickHandler = ( task: Task ) => {
		recordTracksEvent( 'calypso_reader_onboarding_task_click', {
			task: task.id,
		} );
		task?.actionDispatch?.();
	};

	const taskOneCompleted = followedTags ? followedTags.length > 2 : false;

	const tasks: Task[] = [
		{
			id: 'select-interests',
			title: translate( 'Select some of your interests' ),
			actionDispatch: () => setIsInterestsModalOpen( true ),
			completed: taskOneCompleted,
			disabled: false,
		},
		{
			id: 'discover-sites',
			title: translate( "Discover and subscribe to sites you'll love" ),
			actionDispatch: () => setIsDiscoverModalOpen( true ),
			completed: false,
			disabled: ! taskOneCompleted,
		},
	];

	return (
		<>
			<div className="reader-onboarding">
				<div className="reader-onboarding__intro-column">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						numberOfSteps={ tasks.length }
						currentStep={ tasks.filter( ( task ) => task.completed ).length }
					/>
					<h2>{ translate( 'Your personal reading adventure' ) }</h2>
					<p>{ translate( 'Tailor your feed, connect with your favorite topics.' ) }</p>
				</div>
				<div className="reader-onboarding__steps-column">
					<Checklist>
						{ tasks.map( ( task ) => (
							<ChecklistItem
								task={ task }
								key={ task.id }
								onClick={ () => itemClickHandler( task ) }
							/>
						) ) }
					</Checklist>
				</div>
			</div>

			<InterestsModal
				isOpen={ isInterestsModalOpen }
				onClose={ () => setIsInterestsModalOpen( false ) }
				onContinue={ handleInterestsContinue }
			/>
			<SubscribeModal
				isOpen={ isDiscoverModalOpen }
				onClose={ () => setIsDiscoverModalOpen( false ) }
			/>
		</>
	);
};

export default ReaderOnboarding;
