import { FEATURE_STYLE_CUSTOMIZATION, isFreePlanProduct } from '@automattic/calypso-products';
import { updateLaunchpadSettings } from '@automattic/data-stores/src/queries/use-launchpad';
import { localizeUrl } from '@automattic/i18n-utils';
import { Task } from '@automattic/launchpad';
import { QueryClient } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { ADD_TIER_PLAN_HASH } from 'calypso/my-sites/earn/memberships/constants';
import { getSiteIdOrSlug } from '../../task-helper';
import { recordGlobalStylesGattingPlanSelectedResetStylesEvent } from '../../tracking';
import { TaskAction, TaskContext } from '../../types';

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

export const getPlanSelectedTask: TaskAction = ( task, flow, context ): Task => {
	const { siteSlug, displayGlobalStylesWarning, globalStylesMinimumPlan, hasSkippedCheckout } =
		context;

	return {
		...task,
		actionDispatch: () => {
			if ( displayGlobalStylesWarning ) {
				recordGlobalStylesGattingPlanSelectedResetStylesEvent( task, flow, context, {
					displayGlobalStylesWarning,
				} );
			}
		},
		calypso_path: addQueryArgs( `/plans/${ siteSlug }`, {
			...( displayGlobalStylesWarning && {
				plan: globalStylesMinimumPlan,
				feature: FEATURE_STYLE_CUSTOMIZATION,
			} ),
		} ),
		completed: task.completed && ! hasSkippedCheckout,
		subtitle: getPlanTaskSubtitle( task, flow, context, displayGlobalStylesWarning ),
		useCalypsoPath: true,
	};
};

const getPlanCompletedTask: TaskAction = ( task, flow, context ) => {
	const { translatedPlanName, displayGlobalStylesWarning, site, siteSlug } = context;

	const isCurrentPlanFree = site?.plan ? isFreePlanProduct( site?.plan ) : true;

	return {
		...task,
		calypso_path: addQueryArgs( `/setup/${ flow }/plans`, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
		} ),
		badge_text: task.completed ? translatedPlanName : task.badge_text,
		subtitle: getPlanTaskSubtitle( task, flow, context, displayGlobalStylesWarning ),
		disabled: task.completed && ! isCurrentPlanFree,
		useCalypsoPath: true,
	};
};

//TODO: Move the updateLaunchpadSettings to be a hoook and use queryclient to invalidate the hook.
const completePaidNewsletterTask = async ( siteSlug: string | null, queryClient: QueryClient ) => {
	if ( siteSlug ) {
		await updateLaunchpadSettings( siteSlug, {
			checklist_statuses: { newsletter_plan_created: true },
		} );
		queryClient?.invalidateQueries( { queryKey: [ 'launchpad' ] } );
	}
};

const getNewsLetterPlanCreated: TaskAction = ( task, flow, context ) => {
	const { site, siteSlug, queryClient, setShowPlansModal } = context;

	return {
		...task,
		actionDispatch: () => {
			completePaidNewsletterTask( siteSlug, queryClient );
			site?.ID
				? setShowPlansModal( true )
				: window.location.assign(
						`/earn/payments/${ siteSlug }?launchpad=add-product${ ADD_TIER_PLAN_HASH }`
				  );
		},
	};
};

export const actions = {
	plan_selected: getPlanSelectedTask,
	plan_completed: getPlanCompletedTask,
	newsletter_plan_created: getNewsLetterPlanCreated,
};
