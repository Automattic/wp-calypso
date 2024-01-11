import { recordTaskClickTracksEvent } from '../../tracking';
import { EnhancedTask, TaskAction, TaskActionTable } from '../../types';

const getSetupFree: TaskAction = ( task, flow, context ): EnhancedTask => ( {
	...task,
	actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
	useCalypsoPath: true,
} );

export const actions: Partial< TaskActionTable > = {
	setup_free: getSetupFree,
};
