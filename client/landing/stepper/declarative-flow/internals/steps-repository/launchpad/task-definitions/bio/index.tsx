import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

const getSetupLinkInBioTask: TaskAction = ( task, flow, context ) => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs(
			`/setup/link-in-bio-post-setup/linkInBioPostSetup`,
			siteInfoQueryArgs
		),
		useCalypsoPath: true,
	};
};

export const actions = {
	setup_link_in_bio: getSetupLinkInBioTask,
};
