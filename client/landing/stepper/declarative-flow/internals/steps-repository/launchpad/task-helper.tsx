import { FEATURE_VIDEO_UPLOADS, planHasFeature, PLAN_PREMIUM } from '@automattic/calypso-products';
import { type SiteDetails, type ChecklistStatuses } from '@automattic/data-stores';
import { isBlogOnboardingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { isVideoPressFlow } from 'calypso/signup/is-flow';
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

	const productSlug = planCartItem?.product_slug ?? site?.plan?.product_slug;
	const isVideoPressFlowWithUnsupportedPlan =
		isVideoPressFlow( flow ) && ! planHasFeature( productSlug as string, FEATURE_VIDEO_UPLOADS );

	// We have to use the site id if the flow allows the user to change the site address
	// as the domain name of the site may be changed.
	// See https://github.com/Automattic/wp-calypso/pull/84532.
	const siteInfoQueryArgs =
		isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow )
			? { siteId: site?.ID }
			: { siteSlug };

	return tasks.map( ( task ) => {
		const context: TaskContext = {
			site,
			tasks,
			siteInfoQueryArgs,
			checklistStatuses,
			isEmailVerified,
			planCartItem,
			domainCartItem,
			productCartItems,
			submit,
			siteSlug,
			displayGlobalStylesWarning,
			globalStylesMinimumPlan,
			isVideoPressFlowWithUnsupportedPlan,
			goToStep,
			stripeConnectUrl,
			queryClient,
			setShowPlansModal,
		};

		return getTaskDefinition( flow, task, context ) || task;
	} );
}

export function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses?: ChecklistStatuses
): boolean {
	return ! site?.plan?.is_free || checklistStatuses?.domain_upsell_deferred === true;
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
