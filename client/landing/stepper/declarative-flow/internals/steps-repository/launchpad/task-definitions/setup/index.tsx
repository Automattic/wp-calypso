import { Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/${ flow }/freePostSetup`, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

export const actions = {
	setup_free: getSetupFreeTask,
};
