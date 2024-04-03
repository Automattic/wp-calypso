import { Card, CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem, type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import {
	A4A_MARKETPLACE_LINK,
	A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
	A4A_SITES_LINK_WALKTHROUGH_TOUR,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import { A4A_ONBOARDING_TOURS_PREFERENCE_NAME } from 'calypso/a8c-for-agencies/sections/onboarding-tours/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getAllRemotePreferences } from 'calypso/state/preferences/selectors';

import './style.scss';

export default function OverviewBodyNextSteps() {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const noActiveSite = useNoActiveSite();
	const preferences = useSelector( getAllRemotePreferences );

	const checkTourCompletion = ( prefSlug: string ): boolean => {
		if ( preferences && A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] ) {
			return A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] in preferences;
		}
		return false;
	};

	const noActiveSite = useNoActiveSite();

	const resetTour = ( prefSlugs: string[] ): void => {
		prefSlugs.forEach( ( slug ) => {
			if ( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ slug ] ) {
				dispatch( savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ slug ], null ) );
			}
		} );
	};

	const addNewSiteTask: Task = {
		calypso_path: A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
		completed: checkTourCompletion( 'addSiteStep1' ),
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
			completed: checkTourCompletion( 'sitesWalkthrough' ),
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
			completed: checkTourCompletion( 'exploreMarketplace' ),
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
	];
	if ( noActiveSite ) {
		// When the user has no active site, the "Add new site" task should be the first step.
		tasks.unshift( addNewSiteTask );
	} else {
		// Otherwise, it should be the last step.
		tasks.push( addNewSiteTask );
	}

	const addNewSiteTask: Task = {
		calypso_path: A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
		completed: checkTourCompletion( 'addSiteStep1' ),
		disabled: false,
		actionDispatch: () => {
			dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_add_sites_click' ) );
			dispatch( savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep1' ], true ) );
		},
		id: 'add_sites',
		title: translate( 'Learn how to add new sites' ),
		useCalypsoPath: true,
	};

	// If we do not have an active site, we want to show the add new site task first in the list.
	if ( noActiveSite ) {
		tasks.unshift( addNewSiteTask );
	} else {
		tasks.push( addNewSiteTask );
	}

	const numberOfTasks = tasks.length;
	const completedTasks = tasks.filter( ( task ) => task.completed ).length;

	const isCompleted = completedTasks === numberOfTasks;

	return (
		<Card>
			<div className="next-steps">
				<div className="next-steps__header">
					<h2>{ isCompleted ? translate( '🎉 Congratulations!' ) : translate( 'Next Steps' ) }</h2>
					<CircularProgressBar
						size={ 32 }
						enableDesktopScaling
						numberOfSteps={ numberOfTasks }
						currentStep={ completedTasks }
					/>
				</div>
				{ isCompleted && (
					<p>
						{ translate(
							"Right now there's nothing left for you to do. We'll let you know when anything needs your attention."
						) }
					</p>
				) }
				<Checklist>
					{ tasks.map( ( task ) => (
						<ChecklistItem task={ task } key={ task.id } />
					) ) }
				</Checklist>
			</div>
		</Card>
	);
}
