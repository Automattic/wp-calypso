import { Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { getSiteIdOrSlug } from '../../task-helper';
import { TaskAction } from '../../types';

export const getDesignSelectedTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

export const getDesignCompletedTask = getDesignSelectedTask;

export const getDesignEditedTask: TaskAction = ( task, flow, context ) => {
	const { site, siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
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
