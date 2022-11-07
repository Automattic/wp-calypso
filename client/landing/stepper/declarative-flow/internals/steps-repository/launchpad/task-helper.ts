import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { launchpadFlowTasks } from './tasks';
import { Task } from './types';

export function getEnhancedTasks(
	tasks: Task[] | null,
	siteSlug: string | null,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ],
	goToStep?: NavigationControls[ 'goToStep' ],
	flow?: string | null
) {
	const enhancedTaskList: Task[] = [];
	const productSlug = site?.plan?.product_slug;
	const translatedPlanName = productSlug ? PLANS_LIST[ productSlug ].getTitle() : '';

	const linkInBioLinksEditCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.links_edited || false;

	const linkInBioSiteLaunchCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.site_launched || false;

	tasks &&
		tasks.map( ( task ) => {
			let taskData = {};
			switch ( task.id ) {
				case 'setup_newsletter':
					taskData = {
						title: translate( 'Personalize Newsletter' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								`/setup/newsletter-post-setup/newsletterPostSetup?siteSlug=${ siteSlug }`
							);
						},
					};
					break;
				case 'plan_selected':
					taskData = {
						title: translate( 'Choose a Plan' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `/plans/${ siteSlug }` );
						},
						badgeText: translatedPlanName,
					};
					break;
				case 'subscribers_added':
					taskData = {
						title: translate( 'Add Subscribers' ),
						actionDispatch: () => {
							if ( goToStep ) {
								recordTaskClickTracksEvent( flow, task.completed, task.id );
								goToStep( 'subscribers' );
							}
						},
					};
					break;
				case 'first_post_published':
					taskData = {
						title: translate( 'Write your first post' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `/post/${ siteSlug }` );
						},
					};
					break;
				case 'design_selected':
					taskData = {
						title: translate( 'Select a design' ),
					};
					break;
				case 'setup_link_in_bio':
					taskData = {
						title: translate( 'Personalize Link in Bio' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								`/setup/link-in-bio-post-setup/linkInBioPostSetup?siteSlug=${ siteSlug }`
							);
						},
					};
					break;
				case 'links_added':
					taskData = {
						title: translate( 'Add links' ),
						completed: linkInBioLinksEditCompleted,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, linkInBioLinksEditCompleted, task.id );
							window.location.assign( `/site-editor/${ siteSlug }` );
						},
					};
					break;
				case 'link_in_bio_launched':
					taskData = {
						title: translate( 'Launch Link in bio' ),
						completed: linkInBioSiteLaunchCompleted,
						disabled: ! linkInBioLinksEditCompleted,
						isLaunchTask: true,
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching Link in bio' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									recordTaskClickTracksEvent( flow, linkInBioSiteLaunchCompleted, task.id );
									window.location.assign( `/home/${ siteSlug }` );
								} );

								submit?.();
							}
						},
					};
					break;
			}
			enhancedTaskList.push( { ...task, ...taskData } );
		} );
	return enhancedTaskList;
}

// Records a generic task click Tracks event
function recordTaskClickTracksEvent(
	flow: string | null | undefined,
	is_completed: boolean,
	task_id: string
) {
	recordTracksEvent( 'calypso_launchpad_task_clicked', {
		task_id,
		is_completed,
		flow,
	} );
}

// Returns list of tasks/checklist items for a specific flow
export function getArrayOfFilteredTasks( tasks: Task[], flow: string | null ) {
	const currentFlowTasksIds = flow ? launchpadFlowTasks[ flow ] : null;
	return (
		currentFlowTasksIds &&
		currentFlowTasksIds.reduce( ( accumulator, currentTaskId ) => {
			tasks.find( ( task ) => {
				if ( task.id === currentTaskId ) {
					accumulator.push( task );
				}
			} );
			return accumulator;
		}, [] as Task[] )
	);
}
