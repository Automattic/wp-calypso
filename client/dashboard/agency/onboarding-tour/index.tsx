import {
	activeAgencyQuery,
	userPreferenceOptimisticMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	createContext,
	lazy,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import { useAnalytics } from '../../app/analytics';
import { MARKETPLACE_PURCHASES_ROUTE } from '../marketplace/paths';
import { PARTNER_DIRECTORY_ROUTE } from '../partner-directory/paths';
import { TEAM_ROUTE } from '../team/paths';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { isOnboardingTourSectionId } from './section-ids';
import { useOnboardingTourHash } from './use-onboarding-tour-hash';
import type { OnboardingTourLinks } from './sections';
import type { ReactNode } from 'react';

const OnboardingTourModal = lazy( () => import( './onboarding-tour-modal' ) );

const CURRENT_SECTION_PREFERENCE = 'a4a-dashboard-onboarding-tour-section';

const RESUME_NOTICE_ID = 'a4a-onboarding-tour-resume';

const LINKS: OnboardingTourLinks = {
	overview: '/overview',
	sites: '/sites',
	marketplace: '/marketplace',
	purchases: MARKETPLACE_PURCHASES_ROUTE,
	referrals: '/referrals',
	migrations: '/migrations',
	woopayments: '/woopayments',
	partnerDirectory: PARTNER_DIRECTORY_ROUTE,
	tiers: '/tiers',
	team: TEAM_ROUTE,
};

const OnboardingTourContext = createContext< { openTour: () => void } >( {
	openTour: () => {},
} );

/**
 * Opens the welcome tour from anywhere under the agency layout.
 */
export function useOnboardingTour() {
	return useContext( OnboardingTourContext );
}

/**
 * Hosts the welcome tour on every agency page: it opens from `#onboarding-tour-{section}`
 * links and `useOnboardingTour()`, and after an explore click offers to pick it back up.
 */
export default function AgencyOnboardingTour( { children }: { children: ReactNode } ) {
	const { recordTracksEvent } = useAnalytics();
	const { isOpen, sectionId, open, close } = useOnboardingTourHash();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );
	const { data: currentSection, isFetched: hasFetchedPreferences } = useQuery(
		userPreferenceQuery( CURRENT_SECTION_PREFERENCE )
	);
	const { mutate: saveCurrentSection } = useMutation(
		userPreferenceOptimisticMutation( CURRENT_SECTION_PREFERENCE )
	);
	const { createInfoNotice, removeNotice } = useDispatch( noticesStore );

	// Opening the tour picks it back up, so the saved section is no longer needed. It is cleared
	// once, as soon as the preferences have loaded: a link can open the tour before they do, and
	// an explore click saves a new section while the tour is still open.
	const shouldClearSavedSection = useRef( false );
	useEffect( () => {
		if ( isOpen ) {
			shouldClearSavedSection.current = true;
		}
	}, [ isOpen ] );
	useEffect( () => {
		if ( ! isOpen || ! hasFetchedPreferences || ! shouldClearSavedSection.current ) {
			return;
		}
		shouldClearSavedSection.current = false;
		if ( currentSection ) {
			saveCurrentSection( undefined );
		}
	}, [ isOpen, hasFetchedPreferences, currentSection, saveCurrentSection ] );

	useEffect( () => {
		if ( ! currentSection || isOpen ) {
			removeNotice( RESUME_NOTICE_ID );
			return;
		}

		createInfoNotice( __( 'Pick up where you left off' ), {
			id: RESUME_NOTICE_ID,
			type: 'snackbar',
			explicitDismiss: true,
			actions: [
				{
					label: __( 'Continue tour' ),
					onClick: () => {
						recordTracksEvent( 'calypso_a4a_onboarding_tour_snackbar_continue_clicked', {
							section: currentSection,
						} );
						open( isOnboardingTourSectionId( currentSection ) ? currentSection : undefined );
					},
				},
			],
			onDismiss: () => {
				recordTracksEvent( 'calypso_a4a_onboarding_tour_snackbar_dismissed' );
				saveCurrentSection( undefined );
			},
		} );
	}, [
		currentSection,
		isOpen,
		createInfoNotice,
		removeNotice,
		open,
		recordTracksEvent,
		saveCurrentSection,
	] );

	const onScheduleCall = useCallback( async () => {
		await scheduleCall();
		close();
	}, [ scheduleCall, close ] );

	const contextValue = useMemo( () => ( { openTour: () => open() } ), [ open ] );

	return (
		<OnboardingTourContext.Provider value={ contextValue }>
			{ children }
			{ isOpen && (
				<Suspense fallback={ null }>
					<OnboardingTourModal
						links={ LINKS }
						sectionId={ sectionId }
						onSectionChange={ open }
						onExplore={ saveCurrentSection }
						onClose={ close }
						onScheduleCall={ onScheduleCall }
						isSchedulingCall={ isSchedulingCall }
						recordTracksEvent={ recordTracksEvent }
					/>
				</Suspense>
			) }
		</OnboardingTourContext.Provider>
	);
}
