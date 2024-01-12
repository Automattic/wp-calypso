import { Task } from '@automattic/launchpad';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction, TaskActionTable } from '../../types';

const getSetupFree: TaskAction = ( task, flow, context ): Task => ( {
	...task,
	actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
	useCalypsoPath: true,
} );

export const actions: Partial< TaskActionTable > = {
	setup_free: getSetupFree,
};
