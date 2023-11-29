import {
	FEATURE_VIDEO_UPLOADS,
	planHasFeature,
	FEATURE_STYLE_CUSTOMIZATION,
} from '@automattic/calypso-products';
import {
	updateLaunchpadSettings,
	type SiteDetails,
	type OnboardActions,
	type SiteActions,
} from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	isBlogOnboardingFlow,
	isDesignFirstFlow,
	isNewsletterFlow,
	isStartWritingFlow,
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
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import useCheckout from 'calypso/landing/stepper/hooks/use-checkout';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ADD_TIER_PLAN_HASH } from 'calypso/my-sites/earn/memberships/constants';
import { isVideoPressFlow } from 'calypso/signup/utils';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { launchpadFlowTasks } from './tasks';
import { LaunchpadChecklist, LaunchpadStatuses, Task } from './types';

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
	globalStylesMinimumPlan: string,
	setShowPlansModal: Dispatch< SetStateAction< boolean > >,
	queryClient: QueryClient,
	goToStep?: NavigationControls[ 'goToStep' ],
	flow: string | null = '',
	isEmailVerified = false,
	checklistStatuses: LaunchpadStatuses = {},
	planCartItem?: MinimalRequestCartProduct | null,
	domainCartItem?: MinimalRequestCartProduct | null,
	productCartItems?: MinimalRequestCartProduct[] | null,
	stripeConnectUrl?: string,
	setShowConfirmModal: () => void = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	isDomainEmailUnverified = false
) {
	if ( ! tasks ) {
		return [];
	}

	const enhancedTaskList: Task[] = [];

	const productSlug =
		( isBlogOnboardingFlow( flow ) ? planCartItem?.product_slug : null ) ??
		site?.plan?.product_slug;

	const translatedPlanName = ( productSlug && PLANS_LIST[ productSlug ]?.getTitle() ) || '';

	const firstPostPublished = Boolean(
		tasks?.find( ( task ) => task.id === 'first_post_published' )?.completed
	);

	const setupBlogCompleted =
		Boolean( tasks?.find( ( task ) => task.id === 'setup_blog' )?.completed ) ||
		! isStartWritingFlow( flow );

	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const planCompleted =
		Boolean( tasks?.find( ( task ) => task.id === 'plan_completed' )?.completed ) ||
		! isBlogOnboardingFlow( flow );

	const videoPressUploadCompleted = Boolean(
		tasks?.find( ( task ) => task.id === 'video_uploaded' )?.completed
	);

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
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.assign(
								addQueryArgs( `/setup/${ flow }/setup-blog`, {
									...{ siteSlug: siteSlug },
								} )
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
					let subtitle = task.subtitle;

					if ( displayGlobalStylesWarning ) {
						const removeCustomStyles = translate( 'Or, {{a}}remove your premium styles{{/a}}.', {
							components: {
								a: (
									<ExternalLink
										children={ null }
										href={ localizeUrl(
											'https://wordpress.com/support/using-styles/#reset-all-styles'
										) }
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
						subtitle = (
							<>
								{ subtitle }&nbsp;{ removeCustomStyles }
							</>
						);
					}

					taskData = {
						actionDispatch: openPlansPage,
						completed,
						subtitle,
					};
					/* eslint-enable no-case-declarations */
					break;
				case 'plan_completed':
					taskData = {
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							const plansUrl = addQueryArgs( `/setup/${ flow }/plans`, {
								...{ siteSlug: siteSlug },
							} );

							window.location.assign( plansUrl );
						},
						badge_text: ! task.completed ? null : translatedPlanName,
						disabled:
							( task.completed || ! domainUpsellCompleted ) && ! isBlogOnboardingFlow( flow ),
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
						actionDispatch: ( force = false ) => {
							if ( ! force ) {
								if ( isDomainEmailUnverified ) {
									setShowConfirmModal();
									return;
								}
							}
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
						actionDispatch: ( force = false ) => {
							if ( site?.ID ) {
								if ( ! force ) {
									if ( isDomainEmailUnverified ) {
										setShowConfirmModal();
										return;
									}
								}

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
						actionDispatch: ( force = false ) => {
							if ( site?.ID ) {
								if ( ! force ) {
									if ( isDomainEmailUnverified ) {
										setShowConfirmModal();
										return;
									}
								}
								const { setPendingAction, setProgressTitle } = dispatch(
									ONBOARD_STORE
								) as OnboardActions;
								const { launchSite } = dispatch( SITE_STORE ) as SiteActions;

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
				case 'blog_launched': {
					// If user selected products during onboarding, update cart and redirect to checkout
					const onboardingCartItems = [
						planCartItem,
						domainCartItem,
						...( productCartItems ?? [] ),
					].filter( Boolean ) as MinimalRequestCartProduct[];
					let title = task.title;
					if ( isBlogOnboardingFlow( flow ) && planCompleted && onboardingCartItems.length ) {
						title = translate( 'Checkout and launch' );
					}

					taskData = {
						isLaunchTask: true,
						title,
						disabled:
							( isStartWritingFlow( flow ) &&
								( ! firstPostPublished ||
									! planCompleted ||
									! domainUpsellCompleted ||
									! setupBlogCompleted ) ) ||
							( isDesignFirstFlow( flow ) &&
								( ! planCompleted || ! domainUpsellCompleted || ! setupBlogCompleted ) ),
						actionDispatch: ( force = false ) => {
							if ( site?.ID ) {
								if ( ! force ) {
									if ( isDomainEmailUnverified ) {
										setShowConfirmModal();
										return;
									}
								}

								const { setPendingAction, setProgressTitle } = dispatch(
									ONBOARD_STORE
								) as OnboardActions;
								setPendingAction( async () => {
									setProgressTitle( __( 'Directing to checkout' ) );
									if ( onboardingCartItems.length ) {
										await replaceProductsInCart( siteSlug as string, onboardingCartItems );
										const { goToCheckout } = useCheckout();
										goToCheckout( {
											flowName: flow ?? '',
											stepName: 'blog_launched',
											siteSlug: siteSlug ?? '',
											destination: `/setup/${ flow }/site-launch?siteSlug=${ siteSlug }`,
											cancelDestination: '/home',
										} );
										return { goToCheckout: true };
									}
									// Launch blog if no items in cart
									const { launchSite } = dispatch( SITE_STORE ) as SiteActions;
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
						actionDispatch: ( force = false ) => {
							if ( site?.ID ) {
								if ( ! force ) {
									if ( isDomainEmailUnverified ) {
										setShowConfirmModal();
										return;
									}
								}

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

							if ( isBlogOnboardingFlow( flow ) ) {
								window.location.assign(
									addQueryArgs( `/setup/${ flow }/domains`, {
										siteSlug,
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
										siteSlug,
										flowToReturnTo: flow,
										new: site?.name,
								  } );
							window.location.assign( destinationUrl );
						},
						badge_text:
							domainUpsellCompleted || isBlogOnboardingFlow( flow )
								? ''
								: translate( 'Upgrade plan' ),
					};
					break;
				case 'verify_domain_email':
					taskData = {
						completed: ! isDomainEmailUnverified,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.completed, task.id );
							window.location.replace( task.calypso_path || `/domains/manage/${ siteSlug }` );
						},
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
