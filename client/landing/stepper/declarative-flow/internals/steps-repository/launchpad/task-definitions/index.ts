import { Task, TaskId, TaskContext, TaskActionTable } from '../types';
import * as setupActions from './setup';

const ALL_ACTIONS: TaskActionTable = {
	setup_free: setupActions.getSetupFreeTask,
};

export const getTaskDefinition = ( flow: string, task: Task, context: TaskContext ) => {
	if ( task.id in ALL_ACTIONS ) {
		return ALL_ACTIONS[ task.id as TaskId ]( task, flow, context );
	}
	return null;
};
