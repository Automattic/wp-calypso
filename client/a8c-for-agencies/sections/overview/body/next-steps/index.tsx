import { Card, CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem, type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { A4A_ONBOARDING_TOURS_PREFERENCE_NAME } from 'calypso/a8c-for-agencies/sections/onboarding-tours/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getAllRemotePreferences } from 'calypso/state/preferences/selectors';

import './style.scss';

export default function OverviewBodyNextSteps( { onDismiss = () => {} } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const preferences = useSelector( getAllRemotePreferences );

	const checkTourCompletion = ( prefSlug: string ): boolean => {
		if ( preferences && A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] ) {
			return A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ prefSlug ] in preferences;
		}
		return false;
	};

	const resetTour = ( prefSlugs: string[] ): void => {
		prefSlugs.forEach( ( slug ) => {
			if ( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ slug ] ) {
				dispatch( savePreference( A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ slug ], null ) );
			}
		} );
	};

	const tasks: Task[] = [
		{
			calypso_path: '/sites?tour=sites-walkthrough',
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
			calypso_path: '/marketplace',
			completed: checkTourCompletion( 'exploreMarketplace' ),
			disabled: false,
			actionDispatch: () => {
				dispatch(
					recordTracksEvent( 'calypso_a4a_overview_next_steps_explore_marketplace_click' )
				);
				resetTour( [ 'exploreMarketplace' ] );
			},
			id: 'explore_marketplace',
			title: translate( 'Explore the marketplace' ),
			useCalypsoPath: true,
		},
		{
			calypso_path: '/sites?tour=add-new-site',
			completed: checkTourCompletion( 'addSiteStep1' ),
			disabled: false,
			actionDispatch: () => {
				dispatch( recordTracksEvent( 'calypso_a4a_overview_next_steps_add_sites_click' ) );
				resetTour( [ 'addSiteStep1', 'addSiteStep2' ] );
			},
			id: 'add_sites',
			title: translate( 'Learn how to add new sites' ),
			useCalypsoPath: true,
		},
	];

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
						) }{ ' ' }
						<button
							className="dismiss"
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_jetpack_manage_overview_next_steps_dismiss_click' )
								);
								onDismiss();
							} }
						>
							{ translate( 'Hide' ) }
						</button>
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
