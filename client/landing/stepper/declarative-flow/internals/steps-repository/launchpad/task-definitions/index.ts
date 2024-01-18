import { isEnabled } from '@automattic/calypso-config';
import { Task, TaskId, TaskContext, TaskActionTable } from '../types';
import { actions as designActions } from './design';
import { actions as domainActions } from './domain';
import { actions as postActions } from './post';
import { actions as setupActions } from './setup';

const DEFINITIONS = {
	...setupActions,
	...designActions,
	...domainActions,
	...postActions,
} satisfies TaskActionTable;

const MIGRATED_FLOWS = [ 'free' ];

const isNewDefinitionAvailable = ( flow: string, taskId: string ) => {
	const isFlowEnabled = MIGRATED_FLOWS.includes( flow );
	const isTaskAvailable = taskId in DEFINITIONS;
	const isFeatureAvailable = isEnabled( 'launchpad/new-task-definition-parser' );

	return isFlowEnabled && isTaskAvailable && isFeatureAvailable;
};

export const getTaskDefinition = ( flow: string, task: Task, context: TaskContext ) => {
	if ( ! isNewDefinitionAvailable( flow, task.id ) ) {
		return null;
	}

	// eslint-disable-next-line no-console
	console.log( 'Using new task definition parser', { taskId: task.id, flowId: flow } );

	return DEFINITIONS[ task.id as TaskId ]( task, flow, context );
};
