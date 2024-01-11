import { recordTaskClickTracksEvent } from '../../task-helper';
import { EnhancedTask, TaskAction, TaskActionTable } from '../../types';

const getSetupFree: TaskAction = ( task, flow ): EnhancedTask =>
	( {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
		useCalypsoPath: true,
	} ) satisfies EnhancedTask;

export const actions: Partial< TaskActionTable > = {
	setup_free: getSetupFree,
};
