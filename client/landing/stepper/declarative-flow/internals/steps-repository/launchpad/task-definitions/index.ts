import { isEnabled } from '@automattic/calypso-config';
import { actions as bioActions } from './bio';
import { actions as contentActions } from './content';
import { actions as designActions } from './design';
import { actions as domainActions } from './domain';
import { actions as emailActions } from './email';
import { actions as planActions } from './plan';
import { actions as postActions } from './post';
import { actions as setupActions } from './setup';
import { actions as siteActions } from './site';
import { actions as subscribersActions } from './subscribers';
import type { Task, TaskId, TaskContext, TaskActionTable } from '../types';

const DEFINITIONS = {
	...setupActions,
	...designActions,
	...domainActions,
	...postActions,
	...siteActions,
	...planActions,
	...emailActions,
	...subscribersActions,
	...contentActions,
	...bioActions,
} satisfies TaskActionTable;

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
