import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useIsEligibleForFeature } from 'calypso/blocks/plugins-update-manager/hooks/use-is-eligible-for-feature';
import { useSiteHasEligiblePlugins } from 'calypso/blocks/plugins-update-manager/hooks/use-site-has-eligible-plugins';
import { ScheduleLogs } from 'calypso/blocks/plugins-update-manager/schedule-logs';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScheduledUpdatesGate from 'calypso/components/scheduled-updates/scheduled-updates-gate';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { MAX_SCHEDULES } from './config';
import { PluginUpdateManagerContextProvider } from './context';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { ScheduleCreate } from './schedule-create';
import { ScheduleEdit } from './schedule-edit';
import { ScheduleList } from './schedule-list';
import './styles.scss';

interface Props {
	siteSlug: string;
	context: 'list' | 'create' | 'edit' | 'logs';
	scheduleId?: string;
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
	onEditSchedule: ( id: string ) => void;
}

export const PluginsUpdateManager = ( props: Props ) => {
	const translate = useTranslate();
	const { siteSlug, context, scheduleId, onNavBack, onCreateNewSchedule, onEditSchedule } = props;
	const siteId = useSelector( getSelectedSiteId );

	const { isEligibleForFeature, isSitePlansLoaded } = useIsEligibleForFeature();
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );

	const hideCreateButton =
		! isEligibleForFeature || schedules.length === MAX_SCHEDULES || schedules.length === 0;

	const { siteHasEligiblePlugins } = useSiteHasEligiblePlugins( siteSlug );

	const { canCreateSchedules } = useCanCreateSchedules( siteSlug, isEligibleForFeature );
	useEffect( () => {
		recordTracksEvent( 'calypso_scheduled_updates_page_view', {
			site_slug: siteSlug,
			context: context,
		} );
	}, [ context, siteSlug ] );

	const { component, title } = {
		logs: {
			component: <ScheduleLogs scheduleId={ scheduleId as string } onNavBack={ onNavBack } />,
			title: translate( 'Scheduled Updates Logs' ),
		},
		list: {
			component: (
				<ScheduleList
					onNavBack={ onNavBack }
					onCreateNewSchedule={ onCreateNewSchedule }
					onEditSchedule={ onEditSchedule }
				/>
			),
			title: translate( 'Scheduled Updates' ),
		},
		create: {
			component: <ScheduleCreate onNavBack={ onNavBack } />,
			title: translate( 'New schedule' ),
		},
		edit: {
			component: <ScheduleEdit scheduleId={ scheduleId } onNavBack={ onNavBack } />,
			title: translate( 'Edit schedule' ),
		},
	}[ context ];

	return (
		<PluginUpdateManagerContextProvider siteSlug={ siteSlug }>
			<DocumentHead title={ title } />
			{ ! isSitePlansLoaded && <QuerySitePlans siteId={ siteId } /> }
			<MainComponent wideLayout>
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Plugin Update Manager' ) }
					subtitle={ translate(
						'Streamline your workflow with scheduled updates, timed to suit your needs.'
					) }
				>
					{ context === 'list' && ! hideCreateButton && onCreateNewSchedule && (
						<Button
							__next40pxDefaultSize
							icon={ plus }
							variant={ canCreateSchedules && siteHasEligiblePlugins ? 'primary' : 'secondary' }
							onClick={ onCreateNewSchedule }
							disabled={ ! canCreateSchedules || ! siteHasEligiblePlugins }
						>
							{ translate( 'Add new schedule' ) }
						</Button>
					) }
				</NavigationHeader>
				<ScheduledUpdatesGate siteId={ siteId as number }>{ component }</ScheduledUpdatesGate>
			</MainComponent>
		</PluginUpdateManagerContextProvider>
	);
};
