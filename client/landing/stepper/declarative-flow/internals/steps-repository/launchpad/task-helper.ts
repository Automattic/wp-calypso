import {
	FEATURE_VIDEO_UPLOADS,
	planHasFeature,
	PLAN_PREMIUM,
	FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
} from '@automattic/calypso-products';
import {
	isFreeFlow,
	isBuildFlow,
	isWriteFlow,
	isNewsletterFlow,
	isStartWritingFlow,
	START_WRITING_FLOW,
} from '@automattic/onboarding';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
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
	tasks: Task[] | null,
	siteSlug: string | null,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ],
	displayGlobalStylesWarning: boolean,
	goToStep?: NavigationControls[ 'goToStep' ],
	flow?: string | null,
	isEmailVerified = false,
	checklistStatuses: LaunchpadStatuses = {},
	planCartProductSlug?: string | null
) {
	const enhancedTaskList: Task[] = [];

	const productSlug =
		( flow === START_WRITING_FLOW ? planCartProductSlug : null ) ?? site?.plan?.product_slug;

	const translatedPlanName = productSlug ? PLANS_LIST[ productSlug ].getTitle() : '';

	const linkInBioLinksEditCompleted = checklistStatuses?.links_edited || false;

	const siteEditCompleted = checklistStatuses?.site_edited || false;

	const siteLaunchCompleted = checklistStatuses?.site_launched || false;

	const firstPostPublishedCompleted = checklistStatuses?.first_post_published || false;

	const planCompleted = checklistStatuses?.plan_selected || ! isStartWritingFlow( flow || null );

	const videoPressUploadCompleted = checklistStatuses?.video_uploaded || false;

	const allowUpdateDesign =
		flow && ( isFreeFlow( flow ) || isBuildFlow( flow ) || isWriteFlow( flow ) );

	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;

	const homePageId = site?.options?.page_on_front;
	// send user to Home page editor, fallback to FSE if page id is not known
	const launchpadUploadVideoLink = homePageId
		? `/page/${ siteSlug }/${ homePageId }`
		: addQueryArgs( `/site-editor/${ siteSlug }`, {
				canvas: 'edit',
		  } );

	let planWarningText = displayGlobalStylesWarning
		? translate(
				'Your site contains custom colors that will only be visible once you upgrade to a Premium plan.'
		  )
		: '';

	const isVideoPressFlowWithUnsupportedPlan =
		isVideoPressFlow( flow ) && ! planHasFeature( productSlug as string, FEATURE_VIDEO_UPLOADS );

	if ( isVideoPressFlowWithUnsupportedPlan ) {
		planWarningText = translate(
			'Upgrade to a plan with VideoPress support to upload your videos.'
		);
	}

	const shouldDisplayWarning = displayGlobalStylesWarning || isVideoPressFlowWithUnsupportedPlan;

	tasks &&
		tasks.map( ( task ) => {
			let taskData = {};
			switch ( task.id ) {
				case 'setup_write':
					taskData = {
						title: translate( 'Set up your site' ),
					};
					break;
				case 'setup_free':
					taskData = {
						title: translate( 'Personalize your site' ),
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
				case 'setup_newsletter':
					taskData = {
						title: translate( 'Personalize newsletter' ),
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
				case 'setup_general':
					taskData = {
						title: translate( 'Set up your site' ),
					};
					break;
				case 'design_edited':
					taskData = {
						title: translate( 'Edit site design' ),
						completed: siteEditCompleted,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, siteEditCompleted, task.id );
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
						title: translate( 'Choose a plan' ),
						subtitle: planWarningText,
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
							if ( isStartWritingFlow( flow || null ) && site?.plan?.is_free ) {
								plansUrl = addQueryArgs( `/setup/${ START_WRITING_FLOW }/plans`, {
									...{ siteSlug: siteSlug, 'start-writing': true },
								} );
							}

							window.location.assign( plansUrl );
						},
						badgeText:
							isVideoPressFlowWithUnsupportedPlan ||
							( isStartWritingFlow( flow || null ) && ! planCompleted )
								? null
								: translatedPlanName,
						completed: ( planCompleted ?? task.completed ) && ! shouldDisplayWarning,
						warning: shouldDisplayWarning,
					};
					break;
				case 'subscribers_added':
					taskData = {
						title: translate( 'Add subscribers' ),
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
						completed: firstPostPublishedCompleted,
						disabled: mustVerifyEmailBeforePosting || false,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `/post/${ siteSlug }` );
						},
					};
					break;
				case 'first_post_published_newsletter':
					taskData = {
						title: translate( 'Start writing' ),
						completed: firstPostPublishedCompleted,
						disabled: mustVerifyEmailBeforePosting || false,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign( `/post/${ siteSlug }` );
						},
					};
					break;
				case 'design_selected':
					taskData = {
						title: translate( 'Select a design' ),
						disabled: ! allowUpdateDesign,
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
						title: translate( 'Personalize Link in Bio' ),
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
						title: translate( 'Add links' ),
						completed: linkInBioLinksEditCompleted,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, linkInBioLinksEditCompleted, task.id );
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
									return { goToHome: true, siteSlug };
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
									recordTaskClickTracksEvent( flow, siteLaunchCompleted, task.id );
									return { goToHome: true, siteSlug };
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
						disabled: isVideoPressFlowWithUnsupportedPlan || videoPressUploadCompleted,
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
						title: translate( 'Choose a domain' ),
						completed: domainUpsellCompleted,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, domainUpsellCompleted, task.id );
							const destinationUrl = domainUpsellCompleted
								? `/domains/manage/${ siteSlug }`
								: addQueryArgs( '/setup/domain-upsell/domains', {
										siteSlug,
										flowToReturnTo: flow,
										new: site?.name,
								  } );
							window.location.assign( destinationUrl );
						},
						badgeText: domainUpsellCompleted ? '' : translate( 'Upgrade plan' ),
					};
					break;
				case 'verify_email':
					taskData = {
						completed: isEmailVerified,
						title: translate( 'Confirm email (check your inbox)' ),
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
	checklist: LaunchpadChecklist,
	isSiteLaunched: boolean
) {
	if ( ! Array.isArray( checklist ) ) {
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
