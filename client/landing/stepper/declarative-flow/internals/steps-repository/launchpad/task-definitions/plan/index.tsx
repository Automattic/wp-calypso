import { FEATURE_VIDEO_UPLOADS, FEATURE_STYLE_CUSTOMIZATION } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordTaskClickTracksEvent } from '../../task-helper';
import { EnhancedTask, Task, TaskAction, TaskActionTable } from '../../types';

const getPlanTaskSubtitle = ( task: Task, flow: string, displayGlobalStylesWarning: boolean ) => {
	if ( ! displayGlobalStylesWarning ) {
		return task.subtitle;
	}

	const removeCustomStyles = translate( 'Or, {{a}}remove your premium styles{{/a}}.', {
		components: {
			a: (
				<ExternalLink
					children={ null }
					href={ localizeUrl( 'https://wordpress.com/support/using-styles/#reset-all-styles' ) }
					onClick={ ( event ) => {
						event.stopPropagation();
						recordTracksEvent(
							'calypso_launchpad_global_styles_gating_plan_selected_reset_styles',
							{ flow }
						);
					} }
				/>
			),
		},
	} );

	return (
		<>
			{ task.subtitle }&nbsp;{ removeCustomStyles }
		</>
	);
};

const getPlanSelected: TaskAction = ( task, flow, context ): EnhancedTask => {
	const {
		siteInfoQueryArgs,
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
		subtitle: getPlanTaskSubtitle( task, flow, displayGlobalStylesWarning ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	plan_selected: getPlanSelected,
};
