import { Task } from '@automattic/launchpad';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

export const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => ( {
	...task,
	actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
	useCalypsoPath: true,
} );
