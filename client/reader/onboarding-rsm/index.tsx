import { flushOnboardingWelcomeDigest } from '@automattic/api-core';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem, Task } from '@automattic/launchpad';
import { Button, Modal } from '@wordpress/components';
import { chevronLeft, close } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import { useExperiment } from 'calypso/lib/explat';
import { useSiteSubscriptions as useCachedSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { useFollowedTags } from 'calypso/reader/data/tags';
import { useNonSelfSubscriptionsCount } from 'calypso/reader/following/hooks/use-non-self-subscriptions-count';
import {
	READER_EARLY_READERS_DECLINED_EVENT,
	READER_EARLY_READERS_EXPERIMENT_NAME,
	READER_EARLY_READERS_OPT_IN_EVENT,
	READER_EARLY_READERS_SOURCE_STEP,
	READER_ONBOARDING_ELIGIBLE_REGISTRATION_DATE,
	READER_ONBOARDING_MIN_FOLLOWED_SITES,
	READER_ONBOARDING_MIN_FOLLOWED_TAGS,
	READER_ONBOARDING_DISMISSED_PREFERENCE_KEY,
	READER_ONBOARDING_SEEN_PREFERENCE_KEY,
	READER_ONBOARDING_PREFERENCE_KEY,
	READER_ONBOARDING_TRACKS_EVENT_PREFIX,
} from 'calypso/reader/onboarding-rsm/constants';
import { EarlyReadersModal } from 'calypso/reader/onboarding-rsm/early-readers-modal';
import InterestsModal from 'calypso/reader/onboarding-rsm/interests-modal';
import { getPackBlogs } from 'calypso/reader/onboarding-rsm/interests-modal/get-pack-blogs';
import { getTopicGroups } from 'calypso/reader/onboarding-rsm/interests-modal/topic-groups';
import SubscribeModal from 'calypso/reader/onboarding-rsm/subscribe-modal';
import WelcomeModal from 'calypso/reader/onboarding-rsm/welcome-modal';
import { useDispatch, useSelector } from 'calypso/state';
import {
	getCurrentUserDate,
	getCurrentUserSiteCount,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getReloadStep } from './get-reload-step';
import { useRefreshFollowingStreams } from './use-refresh-following-streams';
import type { CuratedBlog } from 'calypso/reader/onboarding-rsm/curated-blogs';
import './style.scss';

// All onboarding steps share a single <Modal> frame so transitions between
// them feel seamless (no close/open animation between steps). The active
// step's body is rendered as the only child of the shared modal; the
// per-step CSS class on the modal frame keeps existing styles working.
type Step = 'welcome' | 'interests' | 'discover' | 'early-readers';

const STEP_FRAME_CLASS: Record< Step, string > = {
	welcome: 'reader-welcome-modal',
	interests: 'interests-modal',
	discover: 'subscribe-modal',
	'early-readers': 'early-readers-modal',
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

	const preferencesLoaded = useSelector( hasReceivedRemotePreferences );
	const { isLoading: subscriptionsLoading, nonSelfSubscriptionsCount } =
		useNonSelfSubscriptionsCount();

	const { data: followedTags, isPending: tagsPending } = useFollowedTags();
	// Used in the `completed` event for an instant in-session site-follow
	// count: follows mutations update this query cache, whereas
	// `nonSelfSubscriptionsCount` from `useSiteSubscriptions` can lag until
	// its refetch resolves.
	//
	// The follows query retains stale rows (`is_following: false`) and
	// self-owned subs (`is_owner: true`); we filter both out so the count
	// matches the rest of the onboarding eligibility logic, which uses
	// `nonSelfSubscriptionsCount` (also excludes self-owned). Use
	// `nonSelfSubscriptionsCount` as a baseline so completion analytics do not
	// under-report follows before the follows query has hydrated.
	//
	// `Math.max` is safe in onboarding because the UI only nets follow
	// additions: discover-step recommendations exclude pre-session
	// subscriptions (so in-session unfollows only target in-session adds),
	// and interests-step pack subscribe never unfollows. The invariant is
	// therefore `queryFollowedNonSelfSitesCount >= nonSelfSubscriptionsCount`,
	// so the max picks the live follows-query value. If a future flow ever allows
	// unfollowing a pre-session subscription from within onboarding, revisit
	// this and gate on follows query hydration rather than blindly take the max.
	const { subscriptions } = useCachedSiteSubscriptions();
	const queryFollowedNonSelfSitesCount = subscriptions.filter(
		( subscription ) => subscription.is_following && ! subscription.is_owner
	).length;
	const followedNonSelfSitesCount = Math.max(
		nonSelfSubscriptionsCount,
		queryFollowedNonSelfSitesCount
	);
	const userRegistrationDate = useSelector( getCurrentUserDate ) as string | null;
	const promptVerification = ! useSelector( isCurrentUserEmailVerified );
	const currentUserSiteCount = useSelector( getCurrentUserSiteCount ) as number | null;
	const hasSite = ( currentUserSiteCount ?? 0 ) > 0;
	const primarySiteId = useSelector( getPrimarySiteId ) as number | null;

	const hasCompletedOnboarding: boolean | null = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_PREFERENCE_KEY )
	);
	const hasSeenOnboarding: boolean | null = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_SEEN_PREFERENCE_KEY )
	);
	const hasDismissedOnboarding: boolean | null = useSelector( ( state ) =>
		getPreference( state, READER_ONBOARDING_DISMISSED_PREFERENCE_KEY )
	);

	const hasFollowedTags = ( followedTags?.length ?? 0 ) >= READER_ONBOARDING_MIN_FOLLOWED_TAGS;
	const hasFollowedSites = nonSelfSubscriptionsCount >= READER_ONBOARDING_MIN_FOLLOWED_SITES;

	// Component state that isn't paired with a snapshot effect. The snapshot
	// states (`startingCounts`, `startingForceShow`) live next to the effects
	// that fill them; everything else is grouped here.
	//
	// - `currentStep`: which onboarding modal body is mounted, or `null` when
	//   the modal is closed.
	// - `hasHiddenOnboardingThisSession`: latched when the user finishes the
	//   discover step or permanently dismisses the checklist so onboarding
	//   stays hidden for the rest of the browser session — including under
	//   `reader/force-onboarding` and before subscription queries refresh.
	// - `hasFollowedInInterestsStep`: tracks any subscribe action (tag follow
	//   or pack subscribe) inside the interests step. Owned here so it
	//   persists across remounts of `InterestsModal` — without that, a user
	//   could subscribe to a tagless pack, advance to discover, click Back,
	//   and find the relaxed Continue gate forgotten on the fresh modal.
	// - `hasJoinedEarlyReaders`: latched when the user opts into the Early
	//   Readers program. Owned here (not in `EarlyReadersModal`) because the
	//   parent renders the modal's Back button, which must not offer a route
	//   back to discover from the post-join confirmation state, and because the
	//   dismiss path must not log a decline after an opt-in.
	const [ currentStep, setCurrentStep ] = useState< Step | null >( null );
	const [ hasHiddenOnboardingThisSession, setHasHiddenOnboardingThisSession ] = useState( false );
	const [ hasFollowedInInterestsStep, setHasFollowedInInterestsStep ] = useState( false );
	const [ hasJoinedEarlyReaders, setHasJoinedEarlyReaders ] = useState( false );
	const [ isDismissConfirmOpen, setIsDismissConfirmOpen ] = useState( false );
	const markFollowedInInterestsStep = () => setHasFollowedInInterestsStep( true );
	const hideOnboardingThisSession = () => setHasHiddenOnboardingThisSession( true );

	// Stable blog map for the interests step — initialized lazily the first
	// time the onboarding modal is actually shown, so the random blog selection
	// (getTopicGroups/getPackBlogs) does not run for users who never open the
	// modal. Defined here (not inside InterestsModal) so the selection persists
	// when the user navigates away from the step and returns — InterestsModal
	// unmounts/remounts on each step transition.
	const packBlogsByIdRef = useRef< Map< string, CuratedBlog[] > | null >( null );

	// Tracks which packs the user has explicitly subscribed to this session.
	// Owned here (not inside InterestsModal) so it persists when the user
	// advances to the discover step and then clicks Back.
	const [ relaxedPackCriteria, setRelaxedPackCriteria ] = useState< Set< string > >(
		() => new Set()
	);
	const handlePackSubscribed = ( packId: string ) =>
		setRelaxedPackCriteria( ( current ) => new Set( current ).add( packId ) );

	// Snapshot the user's tag/site follow counts the first time all eligibility
	// inputs are loaded. Eligibility is then evaluated against the snapshot so it
	// stays stable for the rest of the component's life — the modal won't
	// disappear mid-flow as the user follows tags/sites during onboarding.
	//
	// `subscriptionsLoading` (from useSiteSubscriptions / TanStack Query) is only
	// false once the subscriptions response has actually arrived, so the snapshot
	// reflects the real starting count rather than an empty/stale value taken
	// mid-sync.
	const eligibilityDataLoaded = preferencesLoaded && ! tagsPending && ! subscriptionsLoading;
	const [ startingCounts, setStartingCounts ] = useState< {
		followedTagsCount: number;
		followedSitesCount: number;
	} | null >( null );

	useEffect( () => {
		if ( startingCounts !== null || ! eligibilityDataLoaded ) {
			return;
		}
		setStartingCounts( {
			followedTagsCount: followedTags?.length ?? 0,
			followedSitesCount: nonSelfSubscriptionsCount,
		} );
	}, [ startingCounts, eligibilityDataLoaded, followedTags, nonSelfSubscriptionsCount ] );

	// Users registered on or after the cutoff date are eligible regardless of
	// their follow counts — they're new enough that we still want to walk them
	// through onboarding even if they already accumulated subs/tags elsewhere.
	const registeredAfterEligibilityCutoff =
		userRegistrationDate !== null &&
		new Date( userRegistrationDate ) >= new Date( READER_ONBOARDING_ELIGIBLE_REGISTRATION_DATE );

	const meetsEligibility =
		startingCounts !== null &&
		! hasCompletedOnboarding &&
		( startingCounts.followedSitesCount < READER_ONBOARDING_MIN_FOLLOWED_SITES ||
			startingCounts.followedTagsCount < READER_ONBOARDING_MIN_FOLLOWED_TAGS ||
			registeredAfterEligibilityCutoff );

	// Snapshot the "no non-self subscriptions" forceShow signal the first time
	// the subscriptions query loads. Subscribing to a site inside the discover
	// step (or any later step) would update `nonSelfSubscriptionsCount` to
	// a non-zero value and drop the modal mid-flow.
	const [ startingForceShow, setStartingForceShow ] = useState< boolean | null >( null );

	useEffect( () => {
		if ( startingForceShow !== null || subscriptionsLoading ) {
			return;
		}
		setStartingForceShow( nonSelfSubscriptionsCount === 0 );
	}, [ startingForceShow, subscriptionsLoading, nonSelfSubscriptionsCount ] );

	const forceShow = ! hasHiddenOnboardingThisSession && startingForceShow === true;

	const shouldShowOnboarding =
		( isEnabled( 'reader/force-onboarding' ) && ! hasHiddenOnboardingThisSession ) ||
		( ! hasDismissedOnboarding && ( forceShow || !! meetsEligibility ) );

	const shouldRenderOnboarding = shouldShowOnboarding && ! isSuppressed;

	// Early Readers opt-in step (a 4th step after discover), throttled via
	// ExPlat. `isEligible` restricts assignment to users who actually see
	// onboarding, so the experiment's exposure population matches the
	// onboarding-viewed population rather than every Reader visitor. While the
	// assignment is loading (or for control/unassigned users) the flow behaves
	// exactly as the 3-step original. `reader/force-onboarding` also forces the
	// step so the flow is testable without a live assignment.
	const [ , earlyReadersAssignment ] = useExperiment( READER_EARLY_READERS_EXPERIMENT_NAME, {
		isEligible: shouldShowOnboarding,
	} );
	const showEarlyReadersStep =
		isEnabled( 'reader/force-onboarding' ) || earlyReadersAssignment?.variationName === 'treatment';
	const totalOnboardingSteps = showEarlyReadersStep ? 4 : 3;

	// Lazy-initialize the blog map now that we know the modal will be shown.
	// Placing this after shouldRenderOnboarding means getTopicGroups /
	// getPackBlogs never run for the common case where onboarding is not shown.
	if ( shouldRenderOnboarding && ! packBlogsByIdRef.current ) {
		packBlogsByIdRef.current = new Map(
			getTopicGroups().map( ( group ) => [
				group.id,
				getPackBlogs( group.tags, group.tags.length === 0 ? { directKey: group.id } : undefined ),
			] )
		);
	}

	// Non-analytics side effects that run when leaving a step (whether via the
	// X / escape, or via the "continue"/"back"/"finish" button transitioning
	// to the next step). Centralised so the same effects fire on either path.
	// Analytics is intentionally split out into `recordStepClose` so the
	// `*_modal_close` event fires only on an explicit dismiss, not on
	// navigation actions that already have their own continue/back/finish
	// events.
	const runStepSideEffects = ( step: Step ) => {
		if ( step === 'welcome' ) {
			if ( ! hasSeenOnboarding ) {
				dispatch( savePreference( READER_ONBOARDING_SEEN_PREFERENCE_KEY, true ) );
			}
		} else if ( step === 'interests' || step === 'discover' ) {
			refreshFollowingStreams();
		}
	};

	const recordStepClose = ( step: Step ) => {
		if ( step === 'welcome' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_close` );
		} else if ( step === 'interests' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_close` );
		} else if ( step === 'discover' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_close` );
		} else if ( step === 'early-readers' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }early_readers_modal_close` );
		}
	};

	const recordStepOpen = ( step: Step ) => {
		if ( step === 'welcome' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_open` );
		} else if ( step === 'interests' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_open` );
		} else if ( step === 'discover' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_open` );
		} else if ( step === 'early-readers' ) {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }early_readers_modal_open` );
		}
	};

	const openStep = ( step: Step ) => {
		recordStepOpen( step );
		setCurrentStep( step );
	};

	const recordOnboardingCompleted = () => {
		// record tracks for completion regardless of setting, to still track it in flows that forceShow.
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`, {
			followed_tags_count: followedTags?.length ?? 0,
			followed_non_self_sites_count: followedNonSelfSitesCount,
		} );
		if ( hasCompletedOnboarding ) {
			return;
		}
		dispatch( savePreference( READER_ONBOARDING_PREFERENCE_KEY, true ) );
	};

	// Everything that must happen exactly once when the user leaves the flow as
	// "finished" — from discover's Finish (control) or from any early-readers
	// exit (treatment: join, decline, or dismiss).
	const completeOnboarding = ( step: Step ) => {
		// Fire-and-forget: errors are swallowed so Finish UI is never blocked.
		void flushOnboardingWelcomeDigest().catch( () => {} );
		recordOnboardingCompleted();
		runStepSideEffects( step );
		setCurrentStep( null );
		hideOnboardingThisSession();
	};

	// Shared identity for the opt-in and decline events so the two sides of the
	// funnel can be joined on the same fields in the warehouse.
	const earlyReadersEventProps = {
		has_site: hasSite,
		blog_id: primarySiteId,
		source_step: READER_EARLY_READERS_SOURCE_STEP,
	};

	// `decline_method` separates an explicit "No thanks" from closing the modal.
	// Both are non-participation and both belong in the opt-in rate's
	// denominator, but a dismiss is weaker evidence of a real "no" — worth
	// knowing before v1 rewrites the copy.
	const recordEarlyReadersDeclined = ( declineMethod: 'button' | 'dismiss' ) => {
		recordTracksEvent( READER_EARLY_READERS_DECLINED_EVENT, {
			...earlyReadersEventProps,
			decline_method: declineMethod,
		} );
	};

	const handleStepClose = () => {
		if ( currentStep ) {
			recordStepClose( currentStep );
			// The early-readers step only exists past the discover Finish, so the
			// user has already completed onboarding proper — dismissing it must
			// still run the completion work (digest flush, completed event,
			// preference save) that Finish used to own.
			if ( currentStep === 'early-readers' ) {
				// Closing the opt-in screen counts as a decline, so the opt-in
				// rate's denominator stays whole. Skipped after a join: the user
				// is dismissing the confirmation, not the offer.
				if ( ! hasJoinedEarlyReaders ) {
					recordEarlyReadersDeclined( 'dismiss' );
				}
				completeOnboarding( 'early-readers' );
				return;
			}
			runStepSideEffects( currentStep );
		}
		setCurrentStep( null );
	};

	const handleWelcomeContinue = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_continue` );
		runStepSideEffects( 'welcome' );
		recordStepOpen( 'interests' );
		setCurrentStep( 'interests' );
	};

	const handleInterestsContinue = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_continue` );
		runStepSideEffects( 'interests' );
		recordStepOpen( 'discover' );
		setCurrentStep( 'discover' );
	};

	const handleInterestsBack = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_back` );
		runStepSideEffects( 'interests' );
		openStep( 'welcome' );
	};

	const handleDiscoverBack = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_back` );
		runStepSideEffects( 'discover' );
		openStep( 'interests' );
	};

	const handleDiscoverFinish = () => {
		if ( showEarlyReadersStep ) {
			runStepSideEffects( 'discover' );
			openStep( 'early-readers' );
			return;
		}
		completeOnboarding( 'discover' );
	};

	const handleEarlyReadersBack = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }early_readers_modal_back` );
		openStep( 'discover' );
	};

	const handleEarlyReadersJoin = ( interest: string ) => {
		setHasJoinedEarlyReaders( true );
		recordTracksEvent( READER_EARLY_READERS_OPT_IN_EVENT, {
			...earlyReadersEventProps,
			interest,
		} );
	};

	const handleEarlyReadersDecline = () => {
		recordEarlyReadersDeclined( 'button' );
		completeOnboarding( 'early-readers' );
	};

	const handleEarlyReadersFinish = () => {
		completeOnboarding( 'early-readers' );
	};

	const itemClickHandler = ( task: Task ) => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }task_click`, {
			task: task.id,
		} );
		task?.actionDispatch?.();
	};

	const handleDismissClick = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_click` );
		setIsDismissConfirmOpen( true );
	};

	const handleDismissCancel = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_cancel` );
		setIsDismissConfirmOpen( false );
	};

	const handleDismissConfirm = () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_confirm` );
		if ( currentStep ) {
			recordStepClose( currentStep );
			runStepSideEffects( currentStep );
			setCurrentStep( null );
		}
		dispatch( savePreference( READER_ONBOARDING_DISMISSED_PREFERENCE_KEY, true ) );
		setIsDismissConfirmOpen( false );
		hideOnboardingThisSession();
	};

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
			completed: !! hasSeenOnboarding,
			disabled: false,
		},
		{
			id: 'select-interests',
			title: translate( 'Select some of your interests' ),
			actionDispatch: () => openStep( 'interests' ),
			completed: hasFollowedTags,
			disabled: false,
		},
		{
			id: 'discover-sites',
			title: translate( "Discover and subscribe to sites you'll love" ),
			actionDispatch: () => openStep( 'discover' ),
			completed: hasFollowedSites,
			// Mirror the interests-step Continue relaxation: once the user has
			// performed any subscribe action there (e.g. a tagless pack), the
			// discover task is reachable even without 3 followed tags.
			disabled: ! hasFollowedTags && ! hasFollowedInInterestsStep,
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
				label={ translate( 'Back' ) }
			/>
		);
	} else if ( currentStep === 'discover' ) {
		modalBackButton = (
			<Button
				size="compact"
				className="reader-onboarding-modal__back-button"
				onClick={ handleDiscoverBack }
				icon={ chevronLeft }
				label={ translate( 'Back' ) }
			/>
		);
	} else if ( currentStep === 'early-readers' && ! hasJoinedEarlyReaders ) {
		// Once the user is in, Back would walk them from the confirmation into
		// the discover step, implying the opt-in can be undone. It can't.
		modalBackButton = (
			<Button
				size="compact"
				className="reader-onboarding-modal__back-button"
				onClick={ handleEarlyReadersBack }
				icon={ chevronLeft }
				label={ translate( 'Back' ) }
			/>
		);
	}

	return (
		<>
			<div className="reader-onboarding">
				<div className="reader-onboarding__intro-column">
					<div className="reader-onboarding__header">
						<h2>{ translate( 'Your personal reading adventure' ) }</h2>
						<div className="reader-onboarding__header-actions">
							<CircularProgressBar
								size={ 40 }
								enableDesktopScaling
								numberOfSteps={ tasks.length }
								currentStep={ tasks.filter( ( task ) => task.completed ).length }
							/>
							<Button
								size="compact"
								className="reader-onboarding__dismiss-button"
								icon={ close }
								label={ translate( 'Dismiss onboarding checklist' ) }
								onClick={ handleDismissClick }
							/>
						</div>
					</div>
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

			{ isDismissConfirmOpen && (
				<ConfirmDialog
					onRequestClose={ handleDismissCancel }
					title={ translate( 'Dismiss Reader onboarding?' ) }
					className="reader-onboarding__dismiss-confirm-dialog"
				>
					<DialogContent>
						<p>
							{ translate(
								'You will not be able to access the Reader onboarding flow again. Are you sure you want to dismiss it?'
							) }
						</p>
					</DialogContent>
					<DialogFooter>
						<Button variant="tertiary" onClick={ handleDismissCancel }>
							{ translate( 'Cancel' ) }
						</Button>
						<Button variant="primary" isDestructive onClick={ handleDismissConfirm }>
							{ translate( 'Dismiss' ) }
						</Button>
					</DialogFooter>
				</ConfirmDialog>
			) }

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
						<WelcomeModal
							onClose={ handleStepClose }
							onContinue={ handleWelcomeContinue }
							totalSteps={ totalOnboardingSteps }
						/>
					) }
					{ currentStep === 'interests' && (
						<InterestsModal
							onContinue={ handleInterestsContinue }
							promptVerification={ promptVerification }
							hasFollowed={ hasFollowedInInterestsStep }
							onFollowed={ markFollowedInInterestsStep }
							packBlogsById={ packBlogsByIdRef.current! }
							relaxedPackCriteria={ relaxedPackCriteria }
							onPackSubscribed={ handlePackSubscribed }
							totalSteps={ totalOnboardingSteps }
						/>
					) }
					{ currentStep === 'discover' && (
						<SubscribeModal
							onFinish={ handleDiscoverFinish }
							promptVerification={ promptVerification }
							totalSteps={ totalOnboardingSteps }
						/>
					) }
					{ currentStep === 'early-readers' && (
						<EarlyReadersModal
							hasSite={ hasSite }
							hasJoined={ hasJoinedEarlyReaders }
							onDecline={ handleEarlyReadersDecline }
							onJoin={ handleEarlyReadersJoin }
							onFinish={ handleEarlyReadersFinish }
						/>
					) }
				</Modal>
			) }
		</>
	);
};

export default ReaderOnboardingRsm;
