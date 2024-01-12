import { Task, TaskId, TaskContext } from '../types';
import { actions as designActions } from './design';
import { actions as domainActions } from './domain';
import { actions as emailActions } from './email';
import { actions as newsLetterActions } from './newsletter';
import { actions as planActions } from './plan';
import { actions as postActions } from './post';
import { actions as setupActions } from './setup';
import { actions as siteActions } from './site';

const ALL_ACTIONS = new Map(
	Object.entries( {
		...planActions,
		...setupActions,
		...designActions,
		...domainActions,
		...postActions,
		...siteActions,
		...newsLetterActions,
		...emailActions,
	} )
);

export const getTaskDefinition = ( flow: string, task: Task, context: TaskContext ) => {
	return ALL_ACTIONS.has( task.id as TaskId )
		? ALL_ACTIONS.get( task.id as TaskId )?.( task, flow, context )
		: null;
};
