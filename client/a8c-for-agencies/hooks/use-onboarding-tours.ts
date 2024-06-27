import { Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getAllRemotePreferences } from 'calypso/state/preferences/selectors';
import {
	A4A_MARKETPLACE_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
	A4A_SITES_LINK_WALKTHROUGH_TOUR,
} from '../components/sidebar-menu/lib/constants';
import { A4A_ONBOARDING_TOURS_PREFERENCE_NAME } from '../sections/onboarding-tours/constants';
import useNoActiveSite from './use-no-active-site';

const checkTourCompletion = ( preferences: object, prefSlug: string ): boolean => {
	if ( preferences && A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] ) {
		return A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] in preferences;
	}
	return false;
};

export default function useOnboardingTours() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const noActiveSite = useNoActiveSite();

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

	return useMemo( () => {
		const addNewSiteTask: Task = {
			calypso_path: A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
			completed: checkTourCompletion( preferences, 'addSiteStep1' ),
			disabled: false,
			actionDispatch: () => {
				dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_add_sites_click' ) );
				resetTour( [ 'addSiteStep1', 'addSiteStep2' ] );
			},
			id: 'add_sites',
			title: translate( 'Learn how to add new sites' ),
			useCalypsoPath: true,
		};

		const tasks: Task[] = [
			{
				calypso_path: A4A_SITES_LINK_WALKTHROUGH_TOUR,
				completed: checkTourCompletion( preferences, 'sitesWalkthrough' ),
				disabled: false,
				actionDispatch: () => {
					dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_get_familiar_click' ) );
					resetTour( [ 'sitesWalkthrough' ] );
				},
				id: 'get_familiar',
				title: translate( 'Get familiar with the sites management dashboard' ),
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
				title: translate( 'Explore the marketplace' ),
				useCalypsoPath: true,
			},
			...( isSectionNameEnabled( 'a8c-for-agencies-partner-directory' )
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
							title: translate( 'Boost your agency’s visibility across Automattic platforms' ),
							useCalypsoPath: true,
						},
				  ]
				: [] ),
		];

		if ( noActiveSite ) {
			// When the user has no active site, the "Add new site" task should be the first step.
			tasks.unshift( addNewSiteTask );
		} else {
			// Otherwise, it should be the last step.
			tasks.push( addNewSiteTask );
		}

		return tasks;
	}, [ dispatch, noActiveSite, preferences, resetTour, translate ] );
}
