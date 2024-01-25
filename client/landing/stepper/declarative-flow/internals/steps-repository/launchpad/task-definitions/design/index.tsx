import { Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { getSiteInfoQueryArgs } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

const getDesignSelectedTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

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

const getDesignCompletedTask = getDesignSelectedTask;

const getDesignEdited: TaskAction = ( task, flow, context ) => {
	const { site, siteSlug } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

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
	design_edited: getDesignEdited,
};
