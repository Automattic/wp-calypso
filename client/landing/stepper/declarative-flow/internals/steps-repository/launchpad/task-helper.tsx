import {
	FEATURE_VIDEO_UPLOADS,
	planHasFeature,
	FEATURE_STYLE_CUSTOMIZATION,
	getPlans,
	isFreePlanProduct,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import {
	updateLaunchpadSettings,
	type SiteDetails,
	type OnboardActions,
	type SiteActions,
	type ChecklistStatuses,
} from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	isBlogOnboardingFlow,
	isDesignFirstFlow,
	isNewsletterFlow,
	isStartWritingFlow,
	isSiteAssemblerFlow,
	replaceProductsInCart,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ADD_TIER_PLAN_HASH } from 'calypso/my-sites/earn/memberships/constants';
import { isVideoPressFlow } from 'calypso/signup/is-flow';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { goToCheckout } from '../../../../utils/checkout';
import { launchpadFlowTasks } from './tasks';
import { LaunchpadChecklist, Task } from './types';

interface GetEnhancedTasksProps {
	tasks: Task[] | null | undefined;
	siteSlug: string | null;
	site: SiteDetails | null;
	submit: NavigationControls[ 'submit' ];
	displayGlobalStylesWarning?: boolean;
	globalStylesMinimumPlan?: string;
	setShowPlansModal: Dispatch< SetStateAction< boolean > >;
	queryClient: QueryClient;
	goToStep?: NavigationControls[ 'goToStep' ];
	flow: string;
	isEmailVerified?: boolean;
	checklistStatuses?: ChecklistStatuses;
	planCartItem?: MinimalRequestCartProduct | null;
	domainCartItem?: MinimalRequestCartProduct | null;
	productCartItems?: MinimalRequestCartProduct[] | null;
	stripeConnectUrl?: string;
}

const PLANS_LIST = getPlans();
interface EnhancedTask extends Omit< Task, 'badge_text' | 'title' > {
	useCalypsoPath?: boolean;
	badge_text?: ReactNode | string;
	title?: ReactNode | string;
	actionUrl?: string;
}

type TaskId =
	| 'setup_free'
	| 'setup_blog'
	| 'setup_newsletter'
	| 'design_edited'
	| 'plan_selected'
	| 'plan_completed'
	| 'subscribers_added'
	| 'migrate_content'
	| 'first_post_published'
	| 'first_post_published_newsletter'
	| 'design_selected'
	| 'design_completed'
	| 'setup_general'
	| 'setup_link_in_bio'
	| 'links_added'
	| 'link_in_bio_launched'
	| 'site_launched'
	| 'blog_launched'
	| 'videopress_upload'
	| 'videopress_launched'
	| 'domain_upsell'
	| 'verify_email'
	| 'set_up_payments';

interface TaskContext {
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
} as const;

const getTaskDefinition = ( task: Task, flow: string, taskContext: TaskContext ) => {
	return actions[ task.id as TaskId ]( task, flow, taskContext );
};

/**
 * Some attributes of these enhanced tasks will soon be fetched through a WordPress REST
 * API, making said enhancements here unnecessary ( Ex. title, subtitle, completed,
 * subtitle, badge text, etc. ). This will allow us to access checklist and task information
 * outside of the Calypso client.
 *
 * Please ensure that the enhancements you are adding here are attributes that couldn't be
 * generated in the REST API
 */
export function getEnhancedTasks( {
	tasks,
	siteSlug = '',
	site = null,
	submit,
	displayGlobalStylesWarning = false,
	globalStylesMinimumPlan = PLAN_PREMIUM,
	setShowPlansModal,
	queryClient,
	goToStep,
	flow = '',
	isEmailVerified = false,
	checklistStatuses = {},
	planCartItem,
	domainCartItem,
	productCartItems,
	stripeConnectUrl,
}: GetEnhancedTasksProps ) {
	if ( ! tasks ) {
		return [];
	}

	const isCurrentPlanFree = site?.plan ? isFreePlanProduct( site?.plan ) : true;

	const productSlug = planCartItem?.product_slug ?? site?.plan?.product_slug;

	const translatedPlanName = ( productSlug && PLANS_LIST[ productSlug ]?.getTitle() ) || '';

	const completedTasks: Record< string, boolean > = tasks.reduce(
		( acc, cur ) => ( {
			...acc,
			[ cur.id ]: cur.completed,
		} ),
		{}
	);

	const firstPostPublished = completedTasks.first_post_published;

	const setupBlogCompleted = completedTasks.setup_blog || ! isStartWritingFlow( flow );

	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const planCompleted = completedTasks.plan_completed;

	const videoPressUploadCompleted = completedTasks.video_uploaded;

	const setupSiteCompleted = completedTasks.setup_free;

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

	// We have to use the site id if the flow allows the user to change the site address
	// as the domain name of the site may be changed.
	// See https://github.com/Automattic/wp-calypso/pull/84532.
	const siteInfoQueryArgs: { siteId?: number; siteSlug?: string | null } =
		isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow )
			? { siteId: site?.ID }
			: { siteSlug };

	const completeMigrateContentTask = async () => {
		if ( siteSlug ) {
			await updateLaunchpadSettings( siteSlug, {
				checklist_statuses: { migrate_content: true },
			} );
		}
	};

	const completePaidNewsletterTask = async () => {
		if ( siteSlug ) {
			await updateLaunchpadSettings( siteSlug, {
				checklist_statuses: { newsletter_plan_created: true },
			} );
			queryClient?.invalidateQueries( { queryKey: [ 'launchpad' ] } );
		}
	};

	const getOnboardingCartItems = () =>
		[ planCartItem, domainCartItem, ...( productCartItems ?? [] ) ].filter(
			Boolean
		) as MinimalRequestCartProduct[];

	const getPlanTaskSubtitle = ( task: Task ) => {
		if ( ! displayGlobalStylesWarning ) {
			return task.subtitle;
		}

		const removeCustomStyles = translate( 'Or, {{a}}remove your premium styles{{/a}}.', {
			components: {
				a: (
					<ExternalLink
						children={ null }
						href={ localizeUrl( 'https://wordpress.com/support/using-styles/#reset-all-styles' ) }
						onClick={ ( event ) => {
							event.stopPropagation();
							recordTracksEvent(
								'calypso_launchpad_global_styles_gating_plan_selected_reset_styles',
								{ flow }
							);
						} }
					/>
				),
			},
		} );

		return (
			<>
				{ task.subtitle }&nbsp;{ removeCustomStyles }
			</>
		);
	};

	const getLaunchSiteTaskTitle = ( task: Task ) => {
		const onboardingCartItems = getOnboardingCartItems();
		const isSupportedFlow = isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow );
		if ( isSupportedFlow && planCompleted && onboardingCartItems.length ) {
			return translate( 'Checkout and launch' );
		}

		return task.title;
	};

	const getIsLaunchSiteTaskDisabled = () => {
		if ( isStartWritingFlow( flow ) ) {
			return ! (
				firstPostPublished &&
				planCompleted &&
				domainUpsellCompleted &&
				setupBlogCompleted
			);
		}

		if ( isDesignFirstFlow( flow ) ) {
			return ! ( planCompleted && domainUpsellCompleted && setupBlogCompleted );
		}

		if ( isSiteAssemblerFlow( flow ) ) {
			return ! ( planCompleted && domainUpsellCompleted && setupSiteCompleted );
		}

		return false;
	};

	const completeLaunchSiteTask = async ( task: Task ) => {
		if ( ! site?.ID ) {
			return;
		}

		const onboardingCartItems = getOnboardingCartItems();
		const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE ) as OnboardActions;

		setPendingAction( async () => {
			// If user selected products during onboarding, update cart and redirect to checkout
			if ( onboardingCartItems.length ) {
				setProgressTitle( __( 'Directing to checkout' ) );
				await replaceProductsInCart( siteSlug as string, onboardingCartItems );
				goToCheckout( {
					flowName: flow ?? '',
					stepName: 'launchpad',
					siteSlug: siteSlug ?? '',
					destination: `/setup/${ flow }/site-launch?siteSlug=${ siteSlug }`,
					cancelDestination: `/home/${ siteSlug }`,
				} );
				return { goToCheckout: true };
			}

			// Launch the site or blog immediately if no items in cart
			const { launchSite } = dispatch( SITE_STORE ) as SiteActions;
			setProgressTitle(
				task.id === 'blog_launched' ? __( 'Launching blog' ) : __( 'Launching website' )
			);
			await launchSite( site.ID );
			// Waits for half a second so that the loading screen doesn't flash away too quickly
			await new Promise( ( res ) => setTimeout( res, 500 ) );
			recordTaskClickTracksEvent( flow, task.completed, task.id );

			return {
				siteSlug,
				// For the blog onboarding flow and the assembler-first flow.
				isLaunched: true,
				// For the general onboarding flow.
				goToHome: true,
			};
		} );

		submit?.();
	};
	const context: TaskContext = {
		siteInfoQueryArgs,
		displayGlobalStylesWarning,
		shouldDisplayWarning,
		globalStylesMinimumPlan,
		isVideoPressFlowWithUnsupportedPlan,
		getPlanTaskSubtitle,
		isCurrentPlanFree,
		translatedPlanName,
		goToStep,
		completeMigrateContentTask,
		mustVerifyEmailBeforePosting,
		site,
		submit,
		completeLaunchSiteTask,
		getLaunchSiteTaskTitle,
		getIsLaunchSiteTaskDisabled,
		launchpadUploadVideoLink,
		videoPressUploadCompleted,
		domainUpsellCompleted,
		isEmailVerified,
		stripeConnectUrl,
	};

	return ( tasks || [] ).map( ( task ) => {
		let taskData = {};
		switch ( task.id ) {
			case 'setup_free':
			case 'setup_blog':
			case 'setup_newsletter':
			case 'design_edited':
			case 'plan_selected':
			case 'plan_completed':
			case 'subscribers_added':
			case 'migrate_content':
			case 'first_post_published':
			case 'first_post_published_newsletter':
			case 'design_selected':
			case 'design_completed':
			case 'setup_general':
			case 'setup_link_in_bio':
			case 'links_added':
			case 'link_in_bio_launched':
			case 'site_launched':
			case 'blog_launched':
			case 'videopress_upload':
			case 'videopress_launched':
			case 'domain_upsell':
			case 'verify_email':
			case 'set_up_payments':
				return getTaskDefinition( task, flow, context );
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
	} );
}

function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses: ChecklistStatuses
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
