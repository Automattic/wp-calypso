import { Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { TaskAction } from '../../types';

export const getDesignSelectedTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
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
