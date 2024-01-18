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
import { Dispatch, SetStateAction } from 'react';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ADD_TIER_PLAN_HASH } from 'calypso/my-sites/earn/memberships/constants';
import { isVideoPressFlow } from 'calypso/signup/is-flow';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { goToCheckout } from '../../../../utils/checkout';
import { getTaskDefinition } from './task-definitions';
import { launchpadFlowTasks } from './tasks';
import { LaunchpadChecklist, Task, TaskContext } from './types';

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

	const enhancedTaskList: Task[] = [];

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
	const siteInfoQueryArgs =
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

	tasks &&
		tasks.map( ( task ) => {
			let taskData = {};
			let deprecatedData = {};

			const context: TaskContext = {
				site,
				tasks,
				siteInfoQueryArgs,
				checklistStatuses,
				isEmailVerified,
			};

			switch ( task.id ) {
				case 'setup_free':
					// DEPRECATED: This task is deprecated and will be removed in the future
					// eslint-disable-next-line no-case-declarations
					deprecatedData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/setup/${ flow }/freePostSetup`, siteInfoQueryArgs )
							);
						},
					};

					taskData = getTaskDefinition( flow, task, context ) || deprecatedData;
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
								addQueryArgs(
									`/setup/newsletter-post-setup/newsletterPostSetup`,
									siteInfoQueryArgs
								)
							);
						},
					};
					break;
				case 'design_edited':
					deprecatedData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/site-editor/${ siteSlug }`, {
									canvas: 'edit',
								} )
							);
						},
					};
					taskData = getTaskDefinition( flow, task, context ) || deprecatedData;
					break;
				case 'plan_selected':
					/* eslint-disable no-case-declarations */
					const openPlansPage = () => {
						recordTaskClickTracksEvent( flow, task.completed, task.id );
						if ( displayGlobalStylesWarning ) {
							recordTracksEvent(
								'calypso_launchpad_global_styles_gating_plan_selected_task_clicked',
								{ flow }
							);
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
						disabled: mustVerifyEmailBeforePosting || false,
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
					deprecatedData = {
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

					taskData = getTaskDefinition( flow, task, context ) || deprecatedData;
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
					deprecatedData = {
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

					taskData = getTaskDefinition( flow, task, context ) || deprecatedData;
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
								addQueryArgs(
									`/setup/link-in-bio-post-setup/linkInBioPostSetup`,
									siteInfoQueryArgs
								)
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
					deprecatedData = {
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

					taskData = getTaskDefinition( flow, task, context ) || deprecatedData;
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
			enhancedTaskList.push( { ...task, ...taskData } );
		} );
	return enhancedTaskList;
}

export function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses?: ChecklistStatuses
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
