import { Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction, TaskActionTable } from '../../types';

const getPlanSelected: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/update-design/designSetup`, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

const getDesignEdited: TaskAction = ( task, flow, context ) => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/site-editor/${ siteInfoQueryArgs?.siteSlug }`, {
			canvas: 'edit',
		} ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	design_selected: getPlanSelected,
	design_edited: getDesignEdited,
};
