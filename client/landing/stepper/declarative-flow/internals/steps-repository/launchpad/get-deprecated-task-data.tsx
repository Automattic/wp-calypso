import { FEATURE_VIDEO_UPLOADS, FEATURE_STYLE_CUSTOMIZATION } from '@automattic/calypso-products';
import { type SiteDetails, type OnboardActions, type SiteActions } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ADD_TIER_PLAN_HASH } from 'calypso/my-sites/earn/memberships/constants';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { recordTaskClickTracksEvent } from './task-helper';

/**
 * @deprecated The method should not be updated, use the new task-definitions modules to add/update the task definitions
 */
export function getDeprecatedTaskDefinition(
	task: Task,
	flow: string,
	siteInfoQueryArgs:
		| { siteId: number | undefined; siteSlug?: undefined }
		| { siteSlug: string | null; siteId?: undefined },
	siteSlug: string | null,
	displayGlobalStylesWarning: boolean,
	shouldDisplayWarning: boolean,
	globalStylesMinimumPlan: string,
	isVideoPressFlowWithUnsupportedPlan: boolean,
	getPlanTaskSubtitle: ( task: Task ) => ReactNode | string | undefined,
	translatedPlanName: ReactNode | string,
	isCurrentPlanFree: boolean,
	goToStep: ( ( step: string ) => void ) | undefined,
	mustVerifyEmailBeforePosting: boolean,
	completeMigrateContentTask: () => Promise< void >,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ] | undefined,
	getLaunchSiteTaskTitle: ( task: Task ) => string | undefined,
	getIsLaunchSiteTaskDisabled: () => boolean,
	completeLaunchSiteTask: ( task: Task ) => Promise< void >,
	launchpadUploadVideoLink: string,
	videoPressUploadCompleted: boolean,
	domainUpsellCompleted: boolean,
	isEmailVerified: boolean,
	stripeConnectUrl: string | undefined,
	completePaidNewsletterTask: () => Promise< void >,
	setShowPlansModal: Dispatch< SetStateAction< boolean > >
) {
	let taskData = {};
	switch ( task.id ) {
		case 'setup_free':
			taskData = {
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.assign(
						addQueryArgs( `/setup/${ flow }/freePostSetup`, siteInfoQueryArgs )
					);
				},
			};
			break;
		case 'setup_blog':
			taskData = {
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.assign(
						addQueryArgs( `/setup/${ flow }/setup-blog`, siteInfoQueryArgs )
					);
				},
				disabled: task.completed && ! isBlogOnboardingFlow( flow ),
			};
			break;
		case 'setup_newsletter':
			taskData = {
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.assign(
						addQueryArgs( `/setup/newsletter-post-setup/newsletterPostSetup`, siteInfoQueryArgs )
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
			/* eslint-disable no-case-declarations */
			const openPlansPage = () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
				if ( displayGlobalStylesWarning ) {
					recordTracksEvent( 'calypso_launchpad_global_styles_gating_plan_selected_task_clicked', {
						flow,
					} );
				}
				const plansUrl = addQueryArgs( `/plans/${ siteSlug }`, {
					...( shouldDisplayWarning && {
						plan: globalStylesMinimumPlan,
						feature: isVideoPressFlowWithUnsupportedPlan
							? FEATURE_VIDEO_UPLOADS
							: FEATURE_STYLE_CUSTOMIZATION,
					} ),
				} );
				window.location.assign( plansUrl );
			};

			const completed = task.completed && ! isVideoPressFlowWithUnsupportedPlan;

			taskData = {
				actionDispatch: openPlansPage,
				completed,
				subtitle: getPlanTaskSubtitle( task ),
			};
			/* eslint-enable no-case-declarations */
			break;
		case 'plan_completed':
			taskData = {
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					const plansUrl = addQueryArgs( `/setup/${ flow }/plans`, siteInfoQueryArgs );

					window.location.assign( plansUrl );
				},
				badge_text: task.completed ? translatedPlanName : task.badge_text,
				subtitle: getPlanTaskSubtitle( task ),
				disabled: task.completed && ! isCurrentPlanFree,
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
		case 'migrate_content':
			taskData = {
				disabled: mustVerifyEmailBeforePosting || false,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );

					// Mark task done
					completeMigrateContentTask();

					// Go to importers
					window.location.assign( `/import/${ siteSlug }` );
				},
			};
			break;
		case 'first_post_published':
			taskData = {
				disabled:
					mustVerifyEmailBeforePosting ||
					( task.completed && isBlogOnboardingFlow( flow || null ) ) ||
					false,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					const newPostUrl = ! isBlogOnboardingFlow( flow || null )
						? `/post/${ siteSlug }`
						: addQueryArgs( `https://${ siteSlug }/wp-admin/post-new.php`, {
								origin: window.location.origin,
						  } );
					window.location.assign( newPostUrl );
				},
			};
			break;
		case 'first_post_published_newsletter':
			taskData = {
				isLaunchTask: true,
				disabled: mustVerifyEmailBeforePosting || false,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.assign( `/post/${ siteSlug }` );
				},
			};
			break;
		case 'design_selected':
		case 'design_completed':
			taskData = {
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.assign(
						addQueryArgs( `/setup/update-design/designSetup`, {
							...siteInfoQueryArgs,
							flowToReturnTo: flow,
						} )
					);
				},
			};
			break;
		case 'setup_general':
			taskData = {
				disabled: false,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.assign(
						addQueryArgs( `/setup/update-options/options`, {
							...siteInfoQueryArgs,
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
						addQueryArgs( `/setup/link-in-bio-post-setup/linkInBioPostSetup`, siteInfoQueryArgs )
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
						const { setPendingAction, setProgressTitle } = dispatch(
							ONBOARD_STORE
						) as OnboardActions;
						const { launchSite } = dispatch( SITE_STORE ) as SiteActions;

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
				title: getLaunchSiteTaskTitle( task ),
				disabled: getIsLaunchSiteTaskDisabled(),
				actionDispatch: () => {
					completeLaunchSiteTask( task );
				},
			};
			break;
		case 'blog_launched': {
			taskData = {
				isLaunchTask: true,
				title: getLaunchSiteTaskTitle( task ),
				disabled: getIsLaunchSiteTaskDisabled(),
				actionDispatch: () => {
					completeLaunchSiteTask( task );
				},
			};
			break;
		}
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
				isLaunchTask: true,
				actionDispatch: () => {
					if ( site?.ID ) {
						const { setPendingAction, setProgressTitle } = dispatch(
							ONBOARD_STORE
						) as OnboardActions;
						const { launchSite } = dispatch( SITE_STORE ) as SiteActions;

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
				completed: domainUpsellCompleted,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, domainUpsellCompleted, task.id );

					if ( isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow ) ) {
						window.location.assign(
							addQueryArgs( `/setup/${ flow }/domains`, {
								...siteInfoQueryArgs,
								flowToReturnTo: flow,
								new: site?.name,
								domainAndPlanPackage: true,
							} )
						);

						return;
					}

					const destinationUrl = domainUpsellCompleted
						? `/domains/manage/${ siteSlug }`
						: addQueryArgs( `/setup/domain-upsell/domains`, {
								...siteInfoQueryArgs,
								flowToReturnTo: flow,
								new: site?.name,
						  } );
					window.location.assign( destinationUrl );
				},
				badge_text:
					domainUpsellCompleted || isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow )
						? ''
						: translate( 'Upgrade plan' ),
			};
			break;
		case 'verify_email':
			taskData = {
				completed: isEmailVerified,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					window.location.replace( task.calypso_path || '/me/account' );
				},
			};
			break;
		case 'set_up_payments':
			taskData = {
				badge_text: task.completed ? translate( 'Connected' ) : null,
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					stripeConnectUrl
						? window.location.assign( stripeConnectUrl )
						: window.location.assign( `/earn/payments/${ siteSlug }#launchpad` );
				},
			};
			break;
		case 'newsletter_plan_created':
			taskData = {
				actionDispatch: () => {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					completePaidNewsletterTask();
					site?.ID
						? setShowPlansModal( true )
						: window.location.assign(
								`/earn/payments/${ siteSlug }?launchpad=add-product${ ADD_TIER_PLAN_HASH }`
						  );
				},
			};
			break;
	}
	return { ...task, ...taskData };
}
