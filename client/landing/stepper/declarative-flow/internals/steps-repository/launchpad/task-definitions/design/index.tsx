import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../task-helper';
import { TaskAction, TaskActionTable, EnhancedTask } from '../../types';

const getPlanSelected: TaskAction = ( task, flow, context ): EnhancedTask => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
		calypso_path: addQueryArgs( `/setup/update-design/designSetup`, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

const getDesignEdited: TaskAction = ( task, flow, { siteInfoQueryArgs } ) => ( {
	...task,
	actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
	calypso_path: addQueryArgs( `/site-editor/${ siteInfoQueryArgs?.siteSlug }`, {
		canvas: 'edit',
	} ),
	useCalypsoPath: true,
} );

export const actions: Partial< TaskActionTable > = {
	design_selected: getPlanSelected,
	design_edited: getDesignEdited,
};
