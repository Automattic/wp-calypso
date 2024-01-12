import { FEATURE_VIDEO_UPLOADS, FEATURE_STYLE_CUSTOMIZATION } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { Task } from '@automattic/launchpad';
import { ExternalLink } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import {
	recordGlobalStylesGattingPlanSelectedResetStylesEvent,
	recordTaskClickTracksEvent,
} from '../../tracking';
import { TaskAction, TaskActionTable, TaskContext } from '../../types';

const getPlanTaskSubtitle = (
	task: Task,
	flow: string,
	context: TaskContext,
	displayGlobalStylesWarning: boolean
) => {
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
						recordGlobalStylesGattingPlanSelectedResetStylesEvent( task, flow, context, {
							displayGlobalStylesWarning,
						} );
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

const getPlanSelected: TaskAction = ( task, flow, context ): Task => {
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
			recordTaskClickTracksEvent( task, flow, context );
			if ( displayGlobalStylesWarning ) {
				recordGlobalStylesGattingPlanSelectedResetStylesEvent( task, flow, context, {
					displayGlobalStylesWarning,
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
		subtitle: getPlanTaskSubtitle( task, flow, context, displayGlobalStylesWarning ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	plan_selected: getPlanSelected,
};
