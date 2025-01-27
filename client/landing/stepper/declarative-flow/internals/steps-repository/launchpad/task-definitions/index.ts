import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { actions as bioActions } from './bio';
import { actions as contentActions } from './content';
import { actions as designActions } from './design';
import { actions as domainActions } from './domain';
import { actions as emailActions } from './email';
import { actions as paymentsActions } from './payments';
import { actions as planActions } from './plan';
import { actions as postActions } from './post';
import { actions as readymadeTemplateActions } from './readymade-templates';
import { actions as setupActions } from './setup';
import { actions as siteActions } from './site';
import { actions as subscribersActions } from './subscribers';
import type { Task, TaskId, TaskContext, TaskActionTable } from '../types';
import type { SiteDetails, ChecklistStatuses } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { QueryClient } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';

const DEFINITIONS: TaskActionTable = {
	...setupActions,
	...designActions,
	...domainActions,
	...postActions,
	...siteActions,
	...planActions,
	...emailActions,
	...subscribersActions,
	...contentActions,
	...readymadeTemplateActions,
	...bioActions,
	...paymentsActions,
};

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
	hasSkippedCheckout?: boolean;
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
	hasSkippedCheckout = false,
	checklistStatuses = {},
	planCartItem,
	domainCartItem,
	productCartItems,
	stripeConnectUrl,
}: GetEnhancedTasksProps ) {
	if ( ! tasks ) {
		return [];
	}

	// We have to use the site id if the flow allows the user to change the site address
	// as the domain name of the site may be changed.
	// See https://github.com/Automattic/wp-calypso/pull/84532.

	const context: TaskContext = {
		site,
		tasks,
		checklistStatuses,
		isEmailVerified,
		planCartItem,
		domainCartItem,
		productCartItems,
		submit,
		siteSlug,
		displayGlobalStylesWarning,
		globalStylesMinimumPlan,
		goToStep,
		stripeConnectUrl,
		queryClient,
		setShowPlansModal,
		hasSkippedCheckout,
	};

	return tasks.map( ( task ) => {
		if ( task.id in DEFINITIONS ) {
			return DEFINITIONS[ task.id as TaskId ]( task, flow, context );
		}

		return task;
	} );
}
