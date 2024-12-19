import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem, Task } from '@automattic/launchpad';
import { translate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import {
	READER_ONBOARDING_PREFERENCE_KEY,
	READER_ONBOARDING_TRACKS_EVENT_PREFIX,
} from 'calypso/reader/onboarding/constants';
import InterestsModal from 'calypso/reader/onboarding/interests-modal';
import SubscribeModal from 'calypso/reader/onboarding/subscribe-modal';
import { useSelector } from 'calypso/state';
import {
	getCurrentUserDate,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

import './style.scss';

const ReaderOnboarding = ( {
	onRender,
	forceShow = false,
}: {
	onRender?: ( shown: boolean ) => void;
	forceShow?: boolean;
} ) => {
	const [ isInterestsModalOpen, setIsInterestsModalOpen ] = useState( false );
	const [ isDiscoverModalOpen, setIsDiscoverModalOpen ] = useState( false );
	const followedTags = useSelector( getReaderFollowedTags );
	const hasCompletedOnboarding = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_PREFERENCE_KEY )
	);
	const preferencesLoaded = useSelector( hasReceivedRemotePreferences );
	const userRegistrationDate = useSelector( getCurrentUserDate );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const shouldShowOnboarding =
		forceShow ||
		isEnabled( 'reader/force-onboarding' ) ||
		( preferencesLoaded &&
			! hasCompletedOnboarding &&
			userRegistrationDate &&
			isEmailVerified &&
			new Date( userRegistrationDate ) >= new Date( '2024-10-01T00:00:00Z' ) );

	// Track if user viewed Reader Onboarding.
	useEffect( () => {
		if ( shouldShowOnboarding ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }viewed` );
		}
	}, [ shouldShowOnboarding ] );

	// Notify the parent component if onboarding will render.
	onRender?.( shouldShowOnboarding );

	if ( ! shouldShowOnboarding ) {
		return null;
	}

	// Modal state handlers with tracking.
	const openInterestsModal = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_open` );
		setIsInterestsModalOpen( true );
	};

	const closeInterestsModal = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_close` );
		setIsInterestsModalOpen( false );
	};

	const openDiscoverModal = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_open` );
		setIsDiscoverModalOpen( true );
	};

	const closeDiscoverModal = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_close` );
		setIsDiscoverModalOpen( false );
	};

	const handleInterestsContinue = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_continue` );
		closeInterestsModal();
		openDiscoverModal();
	};

	const itemClickHandler = ( task: Task ) => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }task_click`, {
			task: task.id,
		} );
		task?.actionDispatch?.();
	};

	const taskOneCompleted = followedTags ? followedTags.length > 2 : false;

	const tasks: Task[] = [
		{
			id: 'select-interests',
			title: translate( 'Select some of your interests' ),
			actionDispatch: openInterestsModal,
			completed: taskOneCompleted,
			disabled: false,
		},
		{
			id: 'discover-sites',
			title: translate( "Discover and subscribe to sites you'll love" ),
			actionDispatch: openDiscoverModal,
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
				onClose={ closeInterestsModal }
				onContinue={ handleInterestsContinue }
			/>
			<SubscribeModal isOpen={ isDiscoverModalOpen } onClose={ closeDiscoverModal } />
		</>
	);
};

export default ReaderOnboarding;
