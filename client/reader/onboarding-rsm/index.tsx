import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem, Task } from '@automattic/launchpad';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useState, useEffect, useRef } from 'react';
import { useFollowedReaderTags } from 'calypso/data/reader/use-reader-tags';
import {
	READER_ONBOARDING_SEEN_PREFERENCE_KEY,
	READER_ONBOARDING_PREFERENCE_KEY,
	READER_ONBOARDING_TRACKS_EVENT_PREFIX,
} from 'calypso/reader/onboarding-rsm/constants';
import InterestsModal from 'calypso/reader/onboarding-rsm/interests-modal';
import SubscribeModal from 'calypso/reader/onboarding-rsm/subscribe-modal';
import WelcomeModal from 'calypso/reader/onboarding-rsm/welcome-modal';
import { useDispatch, useSelector } from 'calypso/state';
import {
	getCurrentUserDate,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import { useSiteSubscriptions } from '../following/use-site-subscriptions';
import { getReloadStep } from './get-reload-step';
import { useRefreshFollowingStreams } from './use-refresh-following-streams';
import './style.scss';

// All onboarding steps share a single <Modal> frame so transitions between
// them feel seamless (no close/open animation between steps). The active
// step's body is rendered as the only child of the shared modal; the
// per-step CSS class on the modal frame keeps existing styles working.
type Step = 'welcome' | 'interests' | 'discover';

const STEP_FRAME_CLASS: Record< Step, string > = {
	welcome: 'reader-welcome-modal',
	interests: 'interests-modal',
	discover: 'subscribe-modal',
};

const ReaderOnboardingRsm = ( {
	onRender,
	isSuppressed = false,
}: {
	onRender?: ( shown: boolean ) => void;
	isSuppressed?: boolean;
} ) => {
	const dispatch = useDispatch();
	const refreshFollowingStreams = useRefreshFollowingStreams();
	const completionRecordedRef = useRef( false );
	const [ currentStep, setCurrentStep ] = useState< Step | null >( null );
	const [ hasCompletedWelcomeStep, setHasCompletedWelcomeStep ] = useState( false );

	const preferencesLoaded = useSelector( hasReceivedRemotePreferences );
	const userRegistrationDate = useSelector( getCurrentUserDate ) as string | null;
	const { isLoading, hasNonSelfSubscriptions } = useSiteSubscriptions();

	const { data: followedTags } = useFollowedReaderTags();
	const follows = useSelector( getReaderFollows );
	const promptVerification = ! useSelector( isCurrentUserEmailVerified );

	const hasCompletedOnboarding: boolean | null = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_PREFERENCE_KEY )
	);
	const hasSeenOnboarding: boolean | null = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_SEEN_PREFERENCE_KEY )
	);

	const hasFollowedTags = ( followedTags?.length ?? 0 ) > 2;
	const hasFollowedSites = follows?.filter( ( follow ) => ! follow.is_owner )?.length > 2;

	const meetsEligibility =
		preferencesLoaded &&
		! hasCompletedOnboarding &&
		userRegistrationDate !== null &&
		new Date( userRegistrationDate ) >= new Date( '2024-10-01T00:00:00Z' );

	const forceShow = ! isLoading && ! hasNonSelfSubscriptions;

	const shouldShowOnboarding =
		forceShow || isEnabled( 'reader/force-onboarding' ) || !! meetsEligibility;

	const shouldRenderOnboarding = shouldShowOnboarding && ! isSuppressed;

	// Side-effects that run when a given step is closed (whether via the X /
	// escape, or via the "continue" button transitioning to the next step).
	// Centralised so the same effects fire on either path.
	const performStepCloseSideEffects = ( step: Step ) => {
		if ( step === 'welcome' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_close` );
			if ( ! hasSeenOnboarding ) {
				dispatch( savePreference( READER_ONBOARDING_SEEN_PREFERENCE_KEY, true ) );
			}
		} else if ( step === 'interests' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_close` );
			refreshFollowingStreams();
		} else if ( step === 'discover' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_close` );
			refreshFollowingStreams();
		}
	};

	const recordStepOpen = ( step: Step ) => {
		if ( step === 'welcome' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_open` );
		} else if ( step === 'interests' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_open` );
		} else if ( step === 'discover' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_open` );
		}
	};

	const openStep = ( step: Step ) => {
		recordStepOpen( step );
		setCurrentStep( step );
	};

	const handleStepClose = () => {
		if ( currentStep ) {
			performStepCloseSideEffects( currentStep );
		}
		setCurrentStep( null );
	};

	const handleWelcomeContinue = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_continue` );
		setHasCompletedWelcomeStep( true );
		performStepCloseSideEffects( 'welcome' );
		recordStepOpen( 'interests' );
		setCurrentStep( 'interests' );
	};

	const handleInterestsContinue = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_continue` );
		performStepCloseSideEffects( 'interests' );
		recordStepOpen( 'discover' );
		setCurrentStep( 'discover' );
	};

	const handleInterestsBack = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_back` );
		openStep( 'welcome' );
	};

	const handleDiscoverBack = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_back` );
		openStep( 'interests' );
	};

	const itemClickHandler = ( task: Task ) => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }task_click`, {
			task: task.id,
		} );
		task?.actionDispatch?.();
	};

	// Persist completion + track when the user meets the checklist (not during render).
	// `completionRecordedRef` avoids duplicate dispatches/Tracks if this effect re-runs
	// before Redux reflects `hasCompletedOnboarding` (e.g. React StrictMode re-invokes effects).
	useEffect( () => {
		if ( hasCompletedOnboarding || ! hasFollowedTags || ! hasFollowedSites ) {
			return;
		}
		if ( completionRecordedRef.current ) {
			return;
		}
		completionRecordedRef.current = true;
		dispatch( savePreference( READER_ONBOARDING_PREFERENCE_KEY, true ) );
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed` );
	}, [ hasCompletedOnboarding, hasFollowedTags, hasFollowedSites, dispatch ] );

	// Track if user viewed Reader Onboarding.
	useEffect( () => {
		if ( shouldRenderOnboarding ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }viewed` );
		}
	}, [ shouldRenderOnboarding, dispatch ] );

	// Auto-open the welcome step if onboarding should render and it has never been opened before.
	useEffect( () => {
		if ( shouldRenderOnboarding && preferencesLoaded && ! hasSeenOnboarding ) {
			openStep( 'welcome' );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ shouldRenderOnboarding, preferencesLoaded, hasSeenOnboarding, dispatch ] );

	// Reopen a specific onboarding step if signalled by a query param after email verification.
	useEffect( () => {
		const result = getReloadStep( window.location.search );
		if ( result ) {
			openStep( result.step );
			page.redirect(
				`${ window.location.pathname }${ result.cleanedSearch ? '?' + result.cleanedSearch : '' }`
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Notify the parent component if onboarding will render.
	// Use useEffect to avoid calling setState during render (React anti-pattern).
	useEffect( () => {
		onRender?.( shouldShowOnboarding );
	}, [ onRender, shouldShowOnboarding ] );

	if ( ! shouldRenderOnboarding ) {
		return null;
	}

	const tasks: Task[] = [
		{
			id: 'welcome',
			title: translate( 'Welcome to Reader' ),
			actionDispatch: () => openStep( 'welcome' ),
			completed: hasCompletedWelcomeStep,
			disabled: false,
		},
		{
			id: 'select-interests',
			title: translate( 'Select some of your interests' ),
			actionDispatch: () => openStep( 'interests' ),
			completed: hasFollowedTags,
			disabled: ! hasCompletedWelcomeStep,
		},
		{
			id: 'discover-sites',
			title: translate( "Discover and subscribe to sites you'll love" ),
			actionDispatch: () => openStep( 'discover' ),
			completed: hasFollowedSites,
			disabled: ! hasFollowedSites && ! hasFollowedTags,
		},
	];

	let modalBackButton = null;
	if ( currentStep === 'interests' ) {
		modalBackButton = (
			<Button
				size="compact"
				className="reader-onboarding-modal__back-button"
				onClick={ handleInterestsBack }
				icon={ chevronLeft }
				label={ __( 'Back' ) }
			/>
		);
	} else if ( currentStep === 'discover' ) {
		modalBackButton = (
			<Button
				size="compact"
				className="reader-onboarding-modal__back-button"
				onClick={ handleDiscoverBack }
				icon={ chevronLeft }
				label={ __( 'Back' ) }
			/>
		);
	}

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

			{ currentStep && (
				<Modal
					onRequestClose={ handleStepClose }
					size="medium"
					className={ clsx( 'reader-onboarding-rsm-modal', STEP_FRAME_CLASS[ currentStep ], {
						'is-disabled':
							( currentStep === 'discover' || currentStep === 'interests' ) && promptVerification,
					} ) }
					headerActions={ modalBackButton }
				>
					{ currentStep === 'welcome' && (
						<WelcomeModal onClose={ handleStepClose } onContinue={ handleWelcomeContinue } />
					) }
					{ currentStep === 'interests' && (
						<InterestsModal
							onContinue={ handleInterestsContinue }
							promptVerification={ promptVerification }
						/>
					) }
					{ currentStep === 'discover' && (
						<SubscribeModal onClose={ handleStepClose } promptVerification={ promptVerification } />
					) }
				</Modal>
			) }
		</>
	);
};

export default ReaderOnboardingRsm;
