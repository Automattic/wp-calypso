import { addQueryArgs } from '@wordpress/url';
import { type TaskAction } from '../../types';

export const getLinksAddedTask: TaskAction = ( task ) => {
	return {
		...task,
		calyso_path: addQueryArgs( task.calypso_path, { canvas: 'edit' } ),
		useCalypsoPath: true,
	};
};

export const actions = {
	links_added: getLinksAddedTask,
};
