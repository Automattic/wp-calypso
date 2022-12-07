import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isVideoPressFlow } from 'calypso/signup/utils';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { launchpadFlowTasks } from './tasks';
import { Task } from './types';

export function getEnhancedTasks(
	tasks: Task[] | null,
	siteSlug: string | null,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ],
	displayGlobalStylesWarning: boolean,
	goToStep?: NavigationControls[ 'goToStep' ],
	flow?: string | null
) {
	const enhancedTaskList: Task[] = [];
	const productSlug = site?.plan?.product_slug;
	const translatedPlanName = productSlug ? PLANS_LIST[ productSlug ].getTitle() : '';

	const linkInBioLinksEditCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.links_edited || false;

	const siteLaunchCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.site_launched || false;

	const videoPressUploadCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.video_uploaded || false;

	const homePageId = site?.options?.page_on_front;
	// send user to Home page editor, fallback to FSE if page id is not known
	const launchpadUploadVideoLink = homePageId
		? `/page/${ siteSlug }/${ homePageId }`
		: `/site-editor/${ siteSlug }`;

	tasks &&
		tasks.map( ( task ) => {
			let taskData = {};
			switch ( task.id ) {
				case 'setup_free':
					taskData = {
						title: translate( 'Personalize your site' ),
					};
					break;
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
				case 'design_edited':
					taskData = {
						title: translate( 'Edit site design' ),
					};
					break;
				case 'plan_selected':
					taskData = {
						title: translate( 'Choose a Plan' ),
						subtitle: displayGlobalStylesWarning
							? translate(
									'Upgrade to a Premium plan to publish your color changes and unlock tons of other features.'
							  )
							: '',
						disabled: isVideoPressFlow( flow ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								`/plans/${ siteSlug }${ displayGlobalStylesWarning ? '?plan=' + PLAN_PREMIUM : '' }`
							);
						},
						badgeText: translatedPlanName,
						completed: task.completed && ! displayGlobalStylesWarning,
						warning: displayGlobalStylesWarning,
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
						title: translate( 'Launch your site' ),
						completed: siteLaunchCompleted,
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
									recordTaskClickTracksEvent( flow, siteLaunchCompleted, task.id );
									window.location.assign( `/home/${ siteSlug }` );
								} );

								submit?.();
							}
						},
					};
					break;
				case 'site_launched':
					taskData = {
						title: translate( 'Launch your site' ),
						completed: siteLaunchCompleted,
						isLaunchTask: true,
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching Website' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									recordTaskClickTracksEvent( flow, siteLaunchCompleted, task.id );
									window.location.assign( `/home/${ siteSlug }` );
								} );

								submit?.();
							}
						},
					};
					break;
				case 'videopress_setup':
					taskData = {
						completed: true,
						disabled: true,
						title: translate( 'Set up your video site' ),
					};
					break;
				case 'videopress_upload':
					taskData = {
						title: translate( 'Upload your first video' ),
						actionUrl: launchpadUploadVideoLink,
						completed: videoPressUploadCompleted,
						disabled: videoPressUploadCompleted,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.replace( launchpadUploadVideoLink );
						},
					};
					break;
				case 'videopress_launched':
					taskData = {
						title: translate( 'Launch site' ),
						completed: siteLaunchCompleted,
						disabled: ! videoPressUploadCompleted,
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching video site' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									window.location.replace( `/home/${ siteSlug }?forceLoadLaunchpadData=true` );
								} );

								submit?.();
							}
						},
					};
					break;
				case 'sensei_setup':
					taskData = {
						title: translate( 'Set up Course Site' ),
						completed: true,
					};
					break;
				case 'sensei_publish_first_course':
					taskData = {
						title: translate( 'Publish your first Course' ),
						completed:
							site?.options?.launchpad_checklist_tasks_statuses?.publish_first_course || false,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `${ site?.URL }/wp-admin/post-new.php?post_type=course` );
						},
					};
					break;
				case 'site_launched':
					taskData = {
						title: translate( 'Launch Your site' ),
						completed: site?.launch_status === 'launched',
						disabled: site?.launch_status === 'launched',
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching Your Site' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									if ( siteSlug ) {
										window.location.replace( `https://${ siteSlug }` );
									}
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
