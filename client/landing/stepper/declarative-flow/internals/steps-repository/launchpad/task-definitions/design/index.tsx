import { Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

export const getDesignSelectedTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

export const getDesignCompletedTask = getDesignSelectedTask;

export const getDesignEditedTask: TaskAction = ( task, flow, context ) => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, {
			...siteInfoQueryArgs,
			canvas: 'edit',
		} ),
		useCalypsoPath: true,
	};
};

export const actions = {
	design_selected: getDesignSelectedTask,
	design_completed: getDesignCompletedTask,
	design_edited: getDesignEditedTask,
};
