import { FEATURE_VIDEO_UPLOADS, FEATURE_STYLE_CUSTOMIZATION } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordTaskClickTracksEvent } from '../../task-helper';
import { EnhancedTask, TaskAction, TaskActionTable } from '../../types';

const getPlanSelected: TaskAction = ( task, flow, context ): EnhancedTask => {
	const {
		siteInfoQueryArgs,
		getPlanTaskSubtitle,
		displayGlobalStylesWarning,
		shouldDisplayWarning,
		globalStylesMinimumPlan,
		isVideoPressFlowWithUnsupportedPlan,
	} = context;

	return {
		...task,
		actionDispatch: () => {
			recordTaskClickTracksEvent( flow, task.completed, task.id );
			if ( displayGlobalStylesWarning ) {
				recordTracksEvent( 'calypso_launchpad_global_styles_gating_plan_selected_task_clicked', {
					flow,
				} );
			}
		},
		calypso_path: addQueryArgs( `/plans/${ siteInfoQueryArgs?.siteSlug }`, {
			...( shouldDisplayWarning && {
				plan: globalStylesMinimumPlan,
				feature: isVideoPressFlowWithUnsupportedPlan
					? FEATURE_VIDEO_UPLOADS
					: FEATURE_STYLE_CUSTOMIZATION,
			} ),
		} ),
		completed: task.completed && ! isVideoPressFlowWithUnsupportedPlan,
		subtitle: getPlanTaskSubtitle( task ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	plan_selected: getPlanSelected,
};
