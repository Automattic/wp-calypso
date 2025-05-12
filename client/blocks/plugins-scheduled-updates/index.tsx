import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScheduledUpdatesGate from 'calypso/components/scheduled-updates/scheduled-updates-gate';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PluginUpdateManagerContextProvider } from './context';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteHasEligiblePlugins } from './hooks/use-site-has-eligible-plugins';
import { NotificationSettings } from './notification-settings';
import { ScheduleCreate } from './schedule-create';
import { ScheduleEdit } from './schedule-edit';
import { ScheduleList } from './schedule-list';
import { ScheduleLogs } from './schedule-logs';
import './styles.scss';

interface Props {
	siteSlug: string;
	context: 'list' | 'create' | 'edit' | 'logs' | 'notifications';
	scheduleId?: string;
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
	onEditSchedule: ( id: string ) => void;
	onNotificationManagement?: () => void;
	onShowLogs: ( id: string ) => void;
}

export const PluginsScheduledUpdates = ( props: Props ) => {
	const translate = useTranslate();
	const {
		siteSlug,
		context,
		scheduleId,
		onNavBack,
		onCreateNewSchedule,
		onNotificationManagement,
		onEditSchedule,
		onShowLogs,
	} = props;
	const siteId = useSelector( getSelectedSiteId );

	const { isEligibleForFeature, isSitePlansLoaded } = useIsEligibleForFeature();
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );

	const hideCreateButton = ! isEligibleForFeature || schedules.length === 0;

	const { siteHasEligiblePlugins } = useSiteHasEligiblePlugins( siteSlug );
	const { canCreateSchedules } = useCanCreateSchedules( siteSlug, isEligibleForFeature );
	useEffect( () => {
		recordTracksEvent( 'calypso_scheduled_updates_page_view', {
			site_slug: siteSlug,
			context: context,
		} );
	}, [ context, siteSlug ] );

	const [ , setNavigationTitle ] = useState< string | null >( null );

	const { component, title } = {
		logs: {
			component: (
				<ScheduleLogs
					scheduleId={ scheduleId as string }
					onNavBack={ onNavBack }
					setNavigationTitle={ setNavigationTitle }
				/>
			),
			title: translate( 'Scheduled updates logs' ),
		},
		list: {
			component: (
				<ScheduleList
					siteId={ siteId }
					onCreateNewSchedule={ onCreateNewSchedule }
					onEditSchedule={ onEditSchedule }
					onShowLogs={ onShowLogs }
				/>
			),
			title: translate( 'Scheduled updates' ),
		},
		create: {
			component: <ScheduleCreate onNavBack={ onNavBack } />,
			title: translate( 'New schedule' ),
		},
		edit: {
			component: <ScheduleEdit scheduleId={ scheduleId } onNavBack={ onNavBack } />,
			title: translate( 'Edit schedule' ),
		},
		notifications: {
			component: <NotificationSettings onNavBack={ onNavBack } />,
			title: translate( 'Notification settings' ),
		},
	}[ context ];

	useEffect( () => {
		setNavigationTitle( title );
	}, [ title ] );

	return (
		<PluginUpdateManagerContextProvider siteSlug={ siteSlug }>
			<DocumentHead title={ title } />
			{ ! isSitePlansLoaded && <QuerySitePlans siteId={ siteId } /> }
			<MainComponent wideLayout className="plugins-update-manager">
				<NavigationHeader
					className="plugins-update-manager-header"
					navigationItems={ [] }
					title={ translate( 'Plugin Update Manager' ) }
					subtitle={ translate(
						'Streamline your workflow with scheduled updates, timed to suit your needs.'
					) }
				>
					{ context === 'list' && (
						<>
							{ onNotificationManagement && (
								<Button
									__next40pxDefaultSize
									variant="secondary"
									onClick={ onNotificationManagement }
								>
									{ translate( 'Notification settings' ) }
								</Button>
							) }

							{ onCreateNewSchedule && ! hideCreateButton && (
								<Button
									__next40pxDefaultSize
									variant={ canCreateSchedules && siteHasEligiblePlugins ? 'primary' : 'secondary' }
									onClick={ onCreateNewSchedule }
									disabled={ ! canCreateSchedules || ! siteHasEligiblePlugins }
								>
									{ translate( 'New Schedule' ) }
								</Button>
							) }
						</>
					) }
				</NavigationHeader>
				<ScheduledUpdatesGate siteId={ siteId as number }>{ component }</ScheduledUpdatesGate>
			</MainComponent>
		</PluginUpdateManagerContextProvider>
	);
};
