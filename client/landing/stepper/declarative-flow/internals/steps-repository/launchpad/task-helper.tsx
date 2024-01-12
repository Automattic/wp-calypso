import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_VIDEO_UPLOADS,
	planHasFeature,
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
import { isVideoPressFlow } from 'calypso/signup/is-flow';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { goToCheckout } from '../../../../utils/checkout';
import { getDeprecatedTaskDefinition } from './get-deprecated-task-data';
import { getTaskDefinition } from './task-definitions';
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

const MIGRATED_FLOWS = [ 'free', 'start-writing', 'design-first' ];

const shouldUseNewTaskDefinitions = ( flow: string ) => {
	if ( isEnabled( 'launchpad/new-task-definition-parser' ) && MIGRATED_FLOWS.includes( flow ) ) {
		return true;
	}
	return false;
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

	return ( tasks || [] ).map( ( task ) => {
		if ( shouldUseNewTaskDefinitions( flow ) ) {
			const enhanced = getTaskDefinition( flow, task, {
				checklistStatuses,
				tasks,
				siteInfoQueryArgs,
				displayGlobalStylesWarning,
				globalStylesMinimumPlan,
				domainUpsellCompleted,
				site,
				isEmailVerified,
				planCartItem,
				siteSlug,
				submit,
			} );

			if ( enhanced ) {
				// eslint-disable-next-line no-console
				console.log( 'using new task definitions', enhanced.id );
				return enhanced;
			}
		}

		return getDeprecatedTaskDefinition(
			task,
			flow,
			siteInfoQueryArgs,
			siteSlug,
			displayGlobalStylesWarning,
			shouldDisplayWarning,
			globalStylesMinimumPlan,
			isVideoPressFlowWithUnsupportedPlan,
			getPlanTaskSubtitle,
			translatedPlanName,
			isCurrentPlanFree,
			goToStep,
			mustVerifyEmailBeforePosting,
			completeMigrateContentTask,
			site,
			submit,
			getLaunchSiteTaskTitle,
			getIsLaunchSiteTaskDisabled,
			completeLaunchSiteTask,
			launchpadUploadVideoLink,
			videoPressUploadCompleted,
			domainUpsellCompleted,
			isEmailVerified,
			stripeConnectUrl,
			completePaidNewsletterTask,
			setShowPlansModal
		);
	} );
}

export function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses: ChecklistStatuses
): boolean {
	return ! site?.plan?.is_free || checklistStatuses?.domain_upsell_deferred === true;
}

/**
 * @deprecated Please use recordTaskClickTracksEvent instead from tracking.ts
 */
export function recordTaskClickTracksEvent(
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
