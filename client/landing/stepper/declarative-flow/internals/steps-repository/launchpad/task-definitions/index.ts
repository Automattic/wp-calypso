import { isEnabled } from '@automattic/calypso-config';
import { Task, TaskId, TaskContext, TaskActionTable } from '../types';
import * as setupActions from './setup';

const DEFINITIONS: TaskActionTable = {
	setup_free: setupActions.getSetupFreeTask,
};

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

	return DEFINITIONS[ task.id as TaskId ]( task, flow, context );
};
