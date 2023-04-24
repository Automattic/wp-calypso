import {
	FEATURE_VIDEO_UPLOADS,
	planHasFeature,
	PLAN_PREMIUM,
	FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
} from '@automattic/calypso-products';
import { isNewsletterFlow } from '@automattic/onboarding';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isVideoPressFlow } from 'calypso/signup/utils';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { LaunchpadChecklist } from './types';
import type { SiteDetails } from '@automattic/data-stores';

export function getEnhancedChecklist(
	checklist: LaunchpadChecklist,
	siteSlug: string | null,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ],
	displayGlobalStylesWarning: boolean,
	goToStep?: NavigationControls[ 'goToStep' ],
	flow?: string | null,
	isEmailVerified = false
) {
	const enhancedChecklist: LaunchpadChecklist = [];
	const productSlug = site?.plan?.product_slug;
	const translatedPlanName = productSlug ? PLANS_LIST[ productSlug ].getTitle() : '';

	const siteLaunchCompleted = Boolean(
		checklist.find( ( task ) => task.id === 'site_launched' )?.completed
	);

	const videoPressUploadCompleted = Boolean(
		checklist.find( ( task ) => task.id === 'video_uploaded' )?.completed
	);

	// TODO: We should update all references to mustVerifyEmailBeforePosting and isEmailVerified once we are able to retrieve it from the endpoint
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;

	const homePageId = site?.options?.page_on_front;
	// send user to Home page editor, fallback to FSE if page id is not known
	// TODO: We should update all references to launchpadUploadVideoLink once we are able to retrieve it from the endpoint
	const launchpadUploadVideoLink = homePageId
		? `/page/${ siteSlug }/${ homePageId }`
		: addQueryArgs( `/site-editor/${ siteSlug }`, {
				canvas: 'edit',
		  } );

	// TODO: We should update all references to isVideoPressFlowWithUnsupportedPlan once we are able to retrieve it from the endpoint
	const isVideoPressFlowWithUnsupportedPlan =
		isVideoPressFlow( flow ) && ! planHasFeature( productSlug as string, FEATURE_VIDEO_UPLOADS );

	// TODO: We should update all references to shouldDisplayWarning once we are able to retrieve it from the endpoint
	const shouldDisplayWarning = displayGlobalStylesWarning || isVideoPressFlowWithUnsupportedPlan;

	checklist &&
		checklist.map( ( task ) => {
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
							const plansUrl = addQueryArgs( `/plans/${ siteSlug }`, {
								...( shouldDisplayWarning && {
									plan: PLAN_PREMIUM,
									feature: isVideoPressFlowWithUnsupportedPlan
										? FEATURE_VIDEO_UPLOADS
										: FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
								} ),
							} );
							window.location.assign( plansUrl );
						},
						badgeText: isVideoPressFlowWithUnsupportedPlan ? null : translatedPlanName,
						completed: task.completed && ! shouldDisplayWarning,
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
						disabled: mustVerifyEmailBeforePosting || false,
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
									recordTaskClickTracksEvent( flow, task.completed, task.id );
									return { goToHome: true, siteSlug };
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
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							const destinationUrl = task.completed
								? `/domains/manage/${ siteSlug }`
								: addQueryArgs( '/setup/domain-upsell/domains', {
										siteSlug,
										flowToReturnTo: flow,
										new: site?.name,
								  } );
							window.location.assign( destinationUrl );
						},
					};
					break;
				case 'verify_email':
					taskData = {
						completed: isEmailVerified,
					};
					break;
			}
			enhancedChecklist.push( { ...task, ...taskData } );
		} );
	return enhancedChecklist;
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

/*
 * Confirms if final task for a given site_intent is completed.
 * This is used to as a fallback check to determine if the full
 * screen launchpad should be shown or not.
 *
 * @param {LaunchpadChecklist} checklist - The list of tasks for a site's launchpad
 * @param {boolean} isSiteLaunched - The value of a site's is_launched option
 * @returns {boolean} - True if the final task for the given site_intent is completed
 */
export function areLaunchpadTasksCompleted(
	checklist: LaunchpadChecklist,
	isSiteLaunched: boolean
) {
	if ( ! checklist.length ) {
		return false;
	}

	const lastTask = checklist[ checklist.length - 1 ];

	// If last task is site_launched and if site is launched, return true
	// Else return the status of the last task
	if ( lastTask.id === 'site_launched' && isSiteLaunched ) {
		return true;
	}

	return lastTask.completed;
}
