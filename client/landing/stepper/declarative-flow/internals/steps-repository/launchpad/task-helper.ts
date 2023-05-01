import {
	FEATURE_VIDEO_UPLOADS,
	getPlan,
	planHasFeature,
	PLAN_PREMIUM,
	FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
	Plan,
} from '@automattic/calypso-products';
import { isNewsletterFlow, isStartWritingFlow, START_WRITING_FLOW } from '@automattic/onboarding';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isVideoPressFlow } from 'calypso/signup/utils';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { launchpadFlowTasks } from './tasks';
import { LaunchpadChecklist, LaunchpadStatuses, Task } from './types';
import type { SiteDetails } from '@automattic/data-stores';
/**
 * Some attributes of these enhanced tasks will soon be fetched through a WordPress REST
 * API, making said enhancements here unnecessary ( Ex. title, subtitle, completed,
 * subtitle, badge text, etc. ). This will allow us to access checklist and task information
 * outside of the Calypso client.
 *
 * Please ensure that the enhancements you are adding here are attributes that couldn't be
 * generated in the REST API
 */
export function getEnhancedTasks(
	tasks: Task[] | null | undefined,
	siteSlug: string | null,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ],
	displayGlobalStylesWarning: boolean,
	goToStep?: NavigationControls[ 'goToStep' ],
	flow: string | null = '',
	isEmailVerified = false,
	checklistStatuses: LaunchpadStatuses = {},
	planCartProductSlug?: string | null
) {
	if ( ! tasks ) {
		return [];
	}

	const enhancedTaskList: Task[] = [];

	const productSlug =
		( isStartWritingFlow( flow ) ? planCartProductSlug : null ) ?? site?.plan?.product_slug;

	const translatedPlanName = productSlug ? ( getPlan( productSlug ) as Plan ) : '';

	// Todo: setupBlogCompleted should be updated to use a new checklistStatus instead of site_edited.
	//  Explorers will update Jetpack definitions to make this possible, meanwhile we are using site_edited.
	const setupBlogCompleted = checklistStatuses?.site_edited || false;

	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );
	const siteLaunchCompleted = Boolean(
		tasks?.find( ( task ) => task.id === 'site_launched' )?.completed
	);

	const planCompleted =
		Boolean( tasks?.find( ( task ) => task.id === 'site_launched' )?.completed ) ||
		! isStartWritingFlow( flow );

	const videoPressUploadCompleted = Boolean(
		tasks?.find( ( task ) => task.id === 'video_uploaded' )?.completed
	);

	const domainUpsellCompleted = isDomainUpsellCompleted( site );

	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;

	const homePageId = site?.options?.page_on_front;
	// send user to Home page editor, fallback to FSE if page id is not known
	const launchpadUploadVideoLink = homePageId
		? `/page/${ siteSlug }/${ homePageId }`
		: addQueryArgs( `/site-editor/${ siteSlug }`, {
				canvas: 'edit',
		  } );

	const isVideoPressFlowWithUnsupportedPlan =
		isVideoPressFlow( flow ) && ! planHasFeature( productSlug as string, FEATURE_VIDEO_UPLOADS );

	const shouldDisplayWarning = displayGlobalStylesWarning || isVideoPressFlowWithUnsupportedPlan;

	tasks &&
		tasks.map( ( task ) => {
			let taskData = {};
			switch ( task.id ) {
				case 'setup_free':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/setup/free-post-setup/freePostSetup`, {
									siteSlug,
								} )
							);
						},
					};
					break;
				case 'setup_blog':
					taskData = {
						title: translate( 'Set up your blog' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, setupBlogCompleted, task.id );
							window.location.assign(
								addQueryArgs( `/setup/${ START_WRITING_FLOW }/setup-blog`, {
									...{ siteSlug: siteSlug, 'start-writing': true },
								} )
							);
						},
						completed: setupBlogCompleted,
						disabled: setupBlogCompleted,
					};
					break;
				case 'setup_newsletter':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/setup/newsletter-post-setup/newsletterPostSetup`, {
									siteSlug,
								} )
							);
						},
					};
					break;
				case 'design_edited':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/site-editor/${ siteSlug }`, {
									canvas: 'edit',
								} )
							);
						},
					};
					break;
				case 'plan_selected':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							if ( displayGlobalStylesWarning ) {
								recordTracksEvent(
									'calypso_launchpad_global_styles_gating_plan_selected_task_clicked'
								);
							}
							let plansUrl = addQueryArgs( `/plans/${ siteSlug }`, {
								...( shouldDisplayWarning && {
									plan: PLAN_PREMIUM,
									feature: isVideoPressFlowWithUnsupportedPlan
										? FEATURE_VIDEO_UPLOADS
										: FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
								} ),
							} );
							if ( isStartWritingFlow( flow ) && site?.plan?.is_free ) {
								plansUrl = addQueryArgs( `/setup/${ START_WRITING_FLOW }/plans`, {
									...{ siteSlug: siteSlug, 'start-writing': true },
								} );
							}

							window.location.assign( plansUrl );
						},
						badge_text:
							isVideoPressFlowWithUnsupportedPlan ||
							( isStartWritingFlow( flow ) && ! planCompleted )
								? null
								: translatedPlanName,
						completed: ( planCompleted ?? task.completed ) && ! shouldDisplayWarning,
						disabled: isStartWritingFlow( flow ) && ( planCompleted || ! domainUpsellCompleted ),
						warning: shouldDisplayWarning,
					};
					break;
				case 'subscribers_added':
					taskData = {
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
						disabled: mustVerifyEmailBeforePosting || isStartWritingFlow( flow || null ) || false,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `/post/${ siteSlug }` );
						},
					};
					break;
				case 'first_post_published_newsletter':
					taskData = {
						disabled: mustVerifyEmailBeforePosting || false,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `/post/${ siteSlug }` );
						},
					};
					break;
				case 'design_selected':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/setup/update-design/designSetup`, {
									siteSlug,
									flowToReturnTo: flow,
								} )
							);
						},
					};
					break;
				case 'setup_link_in_bio':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/setup/link-in-bio-post-setup/linkInBioPostSetup`, {
									siteSlug,
								} )
							);
						},
					};
					break;
				case 'links_added':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/site-editor/${ siteSlug }`, {
									canvas: 'edit',
								} )
							);
						},
					};
					break;
				case 'link_in_bio_launched':
					taskData = {
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
									recordTaskClickTracksEvent( flow, task.completed, task.id );
									return { goToHome: true, siteSlug };
								} );

								submit?.();
							}
						},
					};
					break;
				case 'site_launched':
					taskData = {
						isLaunchTask: true,
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching website' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									recordTaskClickTracksEvent( flow, siteLaunchCompleted, task.id );
									return { goToHome: true, siteSlug };
								} );

								submit?.();
							}
						},
					};
					break;
				case 'blog_launched':
					taskData = {
						title: translate( 'Launch your blog' ),
						completed: siteLaunchCompleted,
						disabled: isStartWritingFlow( flow ) && ! planCompleted,
						isLaunchTask: true,
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching blog' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									recordTaskClickTracksEvent( flow, task.completed, task.id );
									return { blogLaunched: true, siteSlug };
								} );

								submit?.();
							}
						},
					};
					break;
				case 'videopress_upload':
					taskData = {
						actionUrl: launchpadUploadVideoLink,
						disabled: isVideoPressFlowWithUnsupportedPlan || videoPressUploadCompleted,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.replace( launchpadUploadVideoLink );
						},
					};
					break;
				case 'videopress_launched':
					taskData = {
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching video site' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									window.location.replace(
										addQueryArgs( `/home/${ siteSlug }`, {
											forceLoadLaunchpadData: true,
										} )
									);
								} );

								submit?.();
							}
						},
					};
					break;
				case 'domain_upsell':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, domainUpsellCompleted, task.id );

							if ( isStartWritingFlow( flow || null ) ) {
								window.location.assign(
									addQueryArgs( `/setup/${ START_WRITING_FLOW }/domains`, {
										siteSlug,
										flowToReturnTo: flow,
										new: site?.name,
										domainAndPlanPackage: true,
										[ START_WRITING_FLOW ]: true,
									} )
								);

								return;
							}

							const destinationUrl = domainUpsellCompleted
								? `/domains/manage/${ siteSlug }`
								: addQueryArgs( `/setup/domain-upsell/domains`, {
										siteSlug,
										flowToReturnTo: flow,
										new: site?.name,
								  } );
							window.location.assign( destinationUrl );
						},
						badge_text:
							domainUpsellCompleted || isStartWritingFlow( flow || null )
								? ''
								: translate( 'Upgrade plan' ),
					};
					break;
				case 'verify_email':
					taskData = {
						completed: isEmailVerified,
					};
					break;
			}
			enhancedTaskList.push( { ...task, ...taskData } );
		} );
	return enhancedTaskList;
}

function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses: LaunchpadStatuses
): boolean {
	return ! site?.plan?.is_free || checklistStatuses?.domain_upsell_deferred === true;
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
export function getArrayOfFilteredTasks(
	tasks: Task[],
	flow: string | null,
	isEmailVerified: boolean
) {
	let currentFlowTasksIds = flow ? launchpadFlowTasks[ flow ] : null;

	if ( isEmailVerified && currentFlowTasksIds ) {
		currentFlowTasksIds = currentFlowTasksIds.filter( ( task ) => task !== 'verify_email' );
	}

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

/*
 * Confirms if final task for a given site_intent is completed.
 * This is used to as a fallback check to determine if the full
 * screen launchpad should be shown or not.
 *
 * @param {LaunchpadChecklist} checklist - The list of tasks for a site's launchpad
 * @param {boolean} isSiteLaunched - The value of a site's is_launched option
 * @returns {boolean} - True if the final task for the given site checklist is completed
 */
export function areLaunchpadTasksCompleted(
	checklist: LaunchpadChecklist | null | undefined,
	isSiteLaunched: boolean
) {
	if ( ! checklist || ! Array.isArray( checklist ) ) {
		return false;
	}

	const lastTask = checklist[ checklist.length - 1 ];

	// If last task is site_launched and if site is launched, return true
	// Else return the status of the last task
	if ( lastTask?.id === 'site_launched' && isSiteLaunched ) {
		return true;
	}

	return lastTask?.completed;
}
