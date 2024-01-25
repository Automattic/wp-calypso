import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { actions as contentActions } from './content';
import { actions as designActions } from './design';
import { actions as domainActions } from './domain';
import { actions as emailActions } from './email';
import { actions as paymentsActions } from './payments';
import { actions as planActions } from './plan';
import { actions as postActions } from './post';
import { actions as setupActions } from './setup';
import { actions as siteActions } from './site';
import { actions as subscribersActions } from './subscribers';
import { actions as videoPressActions } from './videopress';
import type { Task, TaskId, TaskContext, TaskActionTable } from './types';
import type { NavigationControls } from '../../../types';
import type { ChecklistStatuses, SiteDetails } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { QueryClient } from '@tanstack/react-query';
import type { SetStateAction, Dispatch } from 'react';

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
	...paymentsActions,
	...videoPressActions,
};

export const NEW_TASK_DEFINITION_PARSER_FEATURE_FLAG = 'launchpad/new-task-definition-parser';

const isNewDefinitionAvailable = ( flow: string, taskId: string ) => {
	const isTaskAvailable = taskId in DEFINITIONS;
	const isFeatureEnabled =
		isEnabled( NEW_TASK_DEFINITION_PARSER_FEATURE_FLAG ) &&
		isEnabled( `${ NEW_TASK_DEFINITION_PARSER_FEATURE_FLAG }/${ flow }` );

	return isTaskAvailable && isFeatureEnabled;
};

export const getTaskDefinition = ( flow: string, task: Task, context: TaskContext ) => {
	if ( ! isNewDefinitionAvailable( flow, task.id ) ) {
		return null;
	}

	// eslint-disable-next-line no-console
	console.log( 'Using new task definition parser', { taskId: task.id, flowId: flow } );

	return DEFINITIONS[ task.id as TaskId ]( task, flow, context );
};

interface GetEnhancedTasksParams {
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
}: GetEnhancedTasksParams ) {
	if ( ! tasks ) {
		return [];
	}

	return tasks.map( ( task ) => {
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
		};

		return getTaskDefinition( flow, task, context ) || task;
	} );
}
