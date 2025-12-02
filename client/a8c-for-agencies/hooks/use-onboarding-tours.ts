import config from '@automattic/calypso-config';
import { Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getAllRemotePreferences, getPreference } from 'calypso/state/preferences/selectors';
import {
	A4A_MARKETPLACE_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
	A4A_TEAM_LINK,
} from '../components/sidebar-menu/lib/constants';
import {
	A4A_ONBOARDING_TOURS_DISMISSED_PREFERENCE_NAME,
	A4A_ONBOARDING_TOURS_PREFERENCE_NAME,
} from '../sections/onboarding-tours/constants';

const checkTourCompletion = ( preferences: object, prefSlug: string ): boolean => {
	if ( preferences && A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] ) {
		return A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] in preferences;
	}
	return false;
};

export default function useOnboardingTours() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const preferences = useSelector( getAllRemotePreferences );

	const resetTour = useCallback(
		( prefSlugs: string[] ): void => {
			prefSlugs.forEach( ( slug ) => {
				if ( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ slug ] ) {
					dispatch(
						savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ slug ], { dismiss: false } )
					);
				}
			} );
		},
		[ dispatch ]
	);

	const dismiss = useCallback( () => {
		dispatch( savePreference( A4A_ONBOARDING_TOURS_DISMISSED_PREFERENCE_NAME, true ) );
	}, [ dispatch ] );

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, A4A_ONBOARDING_TOURS_DISMISSED_PREFERENCE_NAME )
	);

	const tasks = useMemo( () => {
		const tasks: Task[] = [
			{
				calypso_path: A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
				completed: checkTourCompletion( preferences, 'addSiteStep1' ),
				disabled: false,
				actionDispatch: () => {
					dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_add_sites_click' ) );
					resetTour( [ 'addSiteStep1', 'addSiteStep2' ] );
				},
				id: 'add_sites',
				title: translate( 'Add a site' ),
				useCalypsoPath: true,
			},
			{
				calypso_path: A4A_MARKETPLACE_LINK,
				completed: checkTourCompletion( preferences, 'exploreMarketplace' ),
				disabled: false,
				actionDispatch: () => {
					dispatch(
						recordTracksEvent( 'calypso_a4a_overview_next_steps_explore_marketplace_click' )
					);
					dispatch(
						savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'exploreMarketplace' ], true )
					);
				},
				id: 'explore_marketplace',
				title: translate( 'Explore our best-in-class hosting and plugins' ),
				useCalypsoPath: true,
			},
			{
				calypso_path: A4A_REFERRALS_DASHBOARD,
				completed: checkTourCompletion( preferences, 'startReferrals' ),
				disabled: false,
				actionDispatch: () => {
					dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_start_referrals_click' ) );
					dispatch(
						savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'startReferrals' ], true )
					);
				},
				id: 'start_referrals',
				title: translate( 'Start earning commission on referrals' ),
				useCalypsoPath: true,
			},
			...( config.isEnabled( 'a4a-partner-directory' )
				? [
						{
							calypso_path: A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
							completed: checkTourCompletion( preferences, 'boostAgencyVisibility' ),
							disabled: false,
							actionDispatch: () => {
								dispatch(
									recordTracksEvent(
										'calypso_a4a_overview_next_steps_boost_agency_visibility_click'
									)
								);
								dispatch(
									savePreference(
										A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'boostAgencyVisibility' ],
										true
									)
								);
							},
							id: 'boost_agency_visibility',
							title: translate( "Boost your agency's visibilty across our partner directories" ),
							useCalypsoPath: true,
						},
				  ]
				: [] ),
			{
				calypso_path: A4A_TEAM_LINK,
				completed: checkTourCompletion( preferences, 'inviteTeam' ),
				disabled: false,
				actionDispatch: () => {
					dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_invite_team_click' ) );
					dispatch( savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'inviteTeam' ], true ) );
				},
				id: 'invite_team',
				title: translate( 'Invite your team' ),
				useCalypsoPath: true,
			},
		];

		return tasks;
	}, [ dispatch, preferences, resetTour, translate ] );

	const completedTasks = tasks.filter( ( task ) => task.completed );
	const incompleteTasks = tasks.filter( ( task ) => ! task.completed );
	const isCompleted = completedTasks.length === tasks.length;

	return {
		tasks: [ ...incompleteTasks, ...completedTasks ],
		dismiss,
		isDismissed: isDismissed && isCompleted, // In case we add more tasks, we need to check the list is complete before concluding the onboarding is dismissed.
		isCompleted,
		completedTasks,
	};
}
