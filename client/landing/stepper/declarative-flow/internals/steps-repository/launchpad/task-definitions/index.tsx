import { FEATURE_VIDEO_UPLOADS, FEATURE_STYLE_CUSTOMIZATION } from '@automattic/calypso-products';
import { type SiteDetails, type OnboardActions, type SiteActions } from '@automattic/data-stores';
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
import { Task, EnhancedTask } from '../types';
import { recordTaskClickTracksEvent } from './task-helper';

export interface TaskContext {
	siteInfoQueryArgs?: { siteId?: number; siteSlug?: string | null };
	displayGlobalStylesWarning?: boolean;
	shouldDisplayWarning?: boolean;
	globalStylesMinimumPlan?: string;
	isVideoPressFlowWithUnsupportedPlan?: boolean;
	getPlanTaskSubtitle: ( task: Task ) => ReactNode;
	translatedPlanName?: ReactNode | string;
	isCurrentPlanFree?: boolean;
	goToStep?: NavigationControls[ 'goToStep' ];
	mustVerifyEmailBeforePosting?: boolean;
	completeMigrateContentTask?: () => Promise< void >;
	site: SiteDetails | null;
	submit?: NavigationControls[ 'submit' ];
	getLaunchSiteTaskTitle: ( task: Task ) => ReactNode;
	getIsLaunchSiteTaskDisabled: () => boolean;
	completeLaunchSiteTask: ( task: Task ) => Promise< void >;
	launchpadUploadVideoLink: string;
	videoPressUploadCompleted: boolean;
	domainUpsellCompleted: boolean;
	isEmailVerified: boolean;
	stripeConnectUrl?: string;
	completePaidNewsletterTask: () => Promise< void >;
	setShowPlansModal: Dispatch< SetStateAction< boolean > >;
}

type TaskAction = ( task: Task, flow: string, context: TaskContext ) => EnhancedTask;
type TaskActionTable = Record< TaskId, TaskAction >;

const actions: TaskActionTable = {
	setup_free: ( task, flow ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	setup_blog: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			calypso_path: addQueryArgs( `/setup/${ flow }/setup-blog`, siteInfoQueryArgs ),
			disabled: task.completed && ! isBlogOnboardingFlow( flow ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	setup_newsletter: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			calypso_path: addQueryArgs(
				`/setup/newsletter-post-setup/newsletterPostSetup`,
				siteInfoQueryArgs
			),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	design_edited: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			calypso_path: addQueryArgs( `/site-editor/${ siteInfoQueryArgs?.siteSlug }`, {
				canvas: 'edit',
			} ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	plan_selected: (
		task,
		flow,
		{
			siteInfoQueryArgs,
			getPlanTaskSubtitle,
			displayGlobalStylesWarning,
			shouldDisplayWarning,
			globalStylesMinimumPlan,
			isVideoPressFlowWithUnsupportedPlan,
		}
	) =>
		( {
			...task,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
				if ( displayGlobalStylesWarning ) {
					recordTracksEvent( 'calypso_launchpad_global_styles_gating_plan_selected_task_clicked', {
						flow,
					} );
				}
			},
			calypso_path: addQueryArgs( `/plans/${ siteInfoQueryArgs?.siteSlug }`, {
				...( shouldDisplayWarning && {
					plan: globalStylesMinimumPlan,
					feature: isVideoPressFlowWithUnsupportedPlan
						? FEATURE_VIDEO_UPLOADS
						: FEATURE_STYLE_CUSTOMIZATION,
				} ),
			} ),
			completed: task.completed && ! isVideoPressFlowWithUnsupportedPlan,
			subtitle: getPlanTaskSubtitle( task ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	plan_completed: (
		task,
		flow,
		{ siteInfoQueryArgs, getPlanTaskSubtitle, translatedPlanName, isCurrentPlanFree }
	) =>
		( {
			...task,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
			},
			calypso_path: addQueryArgs( `/setup/${ flow }/plans`, siteInfoQueryArgs ),
			badge_text: task.completed ? translatedPlanName : task.badge_text,
			subtitle: getPlanTaskSubtitle( task ),
			disabled: task.completed && ! isCurrentPlanFree,
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	subscribers_added: ( task, flow, { goToStep } ) =>
		( {
			...task,
			actionDispatch: () => {
				if ( goToStep ) {
					recordTaskClickTracksEvent( flow, task.completed, task.id );
					goToStep( 'subscribers' );
				}
			},
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,

	migrate_content: ( task, flow, { mustVerifyEmailBeforePosting, completeMigrateContentTask } ) =>
		( {
			...task,
			disabled: mustVerifyEmailBeforePosting || false,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
				completeMigrateContentTask?.();
			},
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	first_post_published: ( task, flow, { mustVerifyEmailBeforePosting, siteInfoQueryArgs } ) =>
		( {
			...task,
			disabled:
				mustVerifyEmailBeforePosting ||
				( task.completed && isBlogOnboardingFlow( flow || null ) ) ||
				false,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
			},
			calypso_path: ! isBlogOnboardingFlow( flow || null )
				? `/post/${ siteInfoQueryArgs?.siteSlug }`
				: addQueryArgs( `https://${ siteInfoQueryArgs?.siteSlug }/wp-admin/post-new.php`, {
						origin: window.location.origin,
				  } ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	first_post_published_newsletter: ( task, flow, { mustVerifyEmailBeforePosting } ) =>
		( {
			...task,
			isLaunchTask: true,
			disabled: mustVerifyEmailBeforePosting || false,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	design_selected: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			calypso_path: addQueryArgs( `/setup/update-design/designSetup`, {
				...siteInfoQueryArgs,
				flowToReturnTo: flow,
			} ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	design_completed: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			calypso_path: addQueryArgs( `/setup/update-design/designSetup`, {
				...siteInfoQueryArgs,
				flowToReturnTo: flow,
			} ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	setup_general: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			disabled: false,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
			},
			calypso_path: addQueryArgs( `/setup/update-options/options`, {
				...siteInfoQueryArgs,
				flowToReturnTo: flow,
			} ),
		} ) satisfies EnhancedTask,

	setup_link_in_bio: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
			calypso_path: addQueryArgs(
				`/setup/link-in-bio-post-setup/linkInBioPostSetup`,
				siteInfoQueryArgs
			),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	links_added: ( task, flow, { siteInfoQueryArgs } ) =>
		( {
			...task,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
			},
			calypso_path: addQueryArgs( `/site-editor/${ siteInfoQueryArgs?.siteSlug }`, {
				canvas: 'edit',
			} ),
			useCalypsoPath: true,
		} ) satisfies EnhancedTask,

	link_in_bio_launched: ( task, flow, { site, siteInfoQueryArgs, submit } ) =>
		( {
			...task,
			isLaunchTask: true,
			actionDispatch: async () => {
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
						return { goToHome: true, siteSlug: siteInfoQueryArgs?.siteSlug };
					} );

					submit?.();
				}
			},
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,

	site_launched: (
		task,
		_,
		{ getLaunchSiteTaskTitle, getIsLaunchSiteTaskDisabled, completeLaunchSiteTask }
	) =>
		( {
			...task,
			isLaunchTask: true,
			title: getLaunchSiteTaskTitle( task ),
			disabled: getIsLaunchSiteTaskDisabled(),
			actionDispatch: () => completeLaunchSiteTask( task ),
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,

	blog_launched: (
		task,
		_,
		{ getLaunchSiteTaskTitle, getIsLaunchSiteTaskDisabled, completeLaunchSiteTask }
	) =>
		( {
			...task,
			isLaunchTask: true,
			title: getLaunchSiteTaskTitle( task ),
			disabled: getIsLaunchSiteTaskDisabled(),
			actionDispatch: () => completeLaunchSiteTask( task ),
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,

	videopress_upload: (
		task,
		flow,
		{ launchpadUploadVideoLink, isVideoPressFlowWithUnsupportedPlan, videoPressUploadCompleted }
	) =>
		( {
			...task,
			//TODO: Verify if this is the correct actionUrl and if useCalypsoPath is needed
			actionUrl: launchpadUploadVideoLink,
			disabled: isVideoPressFlowWithUnsupportedPlan || videoPressUploadCompleted,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
			},
			calypso_path: launchpadUploadVideoLink,
		} ) satisfies EnhancedTask,

	videopress_launched: ( task, _, { site, siteInfoQueryArgs, submit } ) =>
		( {
			...task,
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
							addQueryArgs( `/home/${ siteInfoQueryArgs?.siteSlug }`, {
								forceLoadLaunchpadData: true,
							} )
						);
					} );

					submit?.();
				}
			},
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,

	domain_upsell: ( task, flow, { siteInfoQueryArgs, domainUpsellCompleted, site } ) =>
		( {
			...task,
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
					? `/domains/manage/${ siteInfoQueryArgs?.siteSlug }`
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
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,

	verify_email: ( task, flow, { isEmailVerified } ) => ( {
		...task,
		completed: isEmailVerified,
		actionDispatch: () => {
			recordTaskClickTracksEvent( flow, task.completed, task.id );
		},
		useCalypsoPath: true,
	} ),

	set_up_payments: ( task, flow, { stripeConnectUrl, siteInfoQueryArgs } ) => ( {
		...task,
		badge_text: task.completed ? translate( 'Connected' ) : null,
		actionDispatch: () => {
			recordTaskClickTracksEvent( flow, task.completed, task.id );
		},
		calypso_path: stripeConnectUrl
			? stripeConnectUrl
			: `/earn/payments/${ siteInfoQueryArgs?.siteSlug }#launchpad`,
	} ),

	newsletter_plan_created: (
		task,
		flow,
		{ siteInfoQueryArgs, site, completePaidNewsletterTask, setShowPlansModal }
	) =>
		( {
			...task,
			actionDispatch: () => {
				recordTaskClickTracksEvent( flow, task.completed, task.id );
				completePaidNewsletterTask();
				site?.ID
					? setShowPlansModal( true )
					: window.location.assign(
							`/earn/payments/${ siteInfoQueryArgs?.siteSlug }?launchpad=add-product${ ADD_TIER_PLAN_HASH }`
					  );
			},
			useCalypsoPath: false,
		} ) satisfies EnhancedTask,
} as const;

export const getTaskDefinition = ( task: Task, flow: string, context: TaskContext ) => {
	if ( task.id in actions ) {
		return actions[ task.id as TaskId ]( task, flow, context );
	}

	return task;
};
