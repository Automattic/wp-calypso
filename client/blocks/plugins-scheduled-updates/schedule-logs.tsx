import {
	__experimentalText as Text,
	Tooltip,
	Spinner,
	Button,
	Card,
	CardHeader,
	CardBody,
} from '@wordpress/components';
import { Icon, info, arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import Timeline from 'calypso/components/timeline';
import TimelineEvent from 'calypso/components/timeline/timeline-event';
import { useCorePluginsQuery } from 'calypso/data/plugins/use-core-plugins-query';
import { useUpdateScheduleLogsQuery } from 'calypso/data/plugins/use-update-schedule-logs-query';
import {
	type ScheduleUpdates,
	useUpdateScheduleQuery,
} from 'calypso/data/plugins/use-update-schedules-query';
import { useDateTimeFormat } from '../plugin-scheduled-updates-common/hooks/use-date-time-format';
import { usePreparePluginsTooltipInfo } from '../plugin-scheduled-updates-common/hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from '../plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteAdminUrl } from './hooks/use-site-admin-url';
import { useSiteSlug } from './hooks/use-site-slug';
import {
	getLogDetails,
	getLogIcon,
	getLogIconStatus,
	addSecondsToFormat,
	shouldIndentTimelineEvent,
} from './schedule-logs.helper';

interface Props {
	scheduleId: string;
	onNavBack?: () => void;
	setNavigationTitle: ( title: string ) => void;
}
export const ScheduleLogs = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { scheduleId, onNavBack, setNavigationTitle } = props;

	const siteAdminUrl = useSiteAdminUrl();
	const {
		dateFormat: phpDateFormat,
		timeFormat: phpTimeFormat,
		convertPhpToMomentFormat,
	} = useDateTimeFormat( siteSlug );
	const dateFormat = convertPhpToMomentFormat( phpDateFormat );
	const timeFormat = addSecondsToFormat( convertPhpToMomentFormat( phpTimeFormat ) );
	const { prepareScheduleName } = usePrepareScheduleName();
	const { preparePluginsTooltipInfo } = usePreparePluginsTooltipInfo( siteSlug );
	const { data: plugins = [] } = useCorePluginsQuery( siteSlug, true, true );
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const {
		data: schedules = [],
		isFetched,
		isPending,
	} = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const schedule = schedules.find( ( s ) => s.id === scheduleId );
	const { data: scheduleLogs = [], isPending: isPendingLogs } = useUpdateScheduleLogsQuery(
		siteSlug,
		scheduleId
	);

	const goToPluginsPage = useCallback( () => {
		window.location.href = `${ siteAdminUrl }plugins.php`;
	}, [ siteAdminUrl ] );

	useEffect( () => {
		// a bit hacky, but needed to override the title
		setTimeout( () => {
			setNavigationTitle(
				`${ translate( 'Logs' ) } - ${ prepareScheduleName( schedule as ScheduleUpdates ) }`
			);
		} );
	}, [ setNavigationTitle, schedule ] );

	if ( isPending ) {
		return <Spinner />;
	}
	// If the schedule is not found, navigate back to the list
	else if ( isFetched && ! schedule ) {
		onNavBack && onNavBack();
		return null;
	}

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							{ translate( 'Back' ) }
						</Button>
					) }
				</div>
				<Text>
					{ translate( 'Logs' ) } - { prepareScheduleName( schedule as ScheduleUpdates ) }
				</Text>
				<div className="ch-placeholder">
					<Text isBlock align="end" lineHeight={ 2.5 }>
						{ translate( '%(pluginsNumber)d plugin', '%(pluginsNumber)d plugins', {
							count: schedule?.args?.length || 0,
							args: {
								pluginsNumber: schedule?.args?.length || 0,
							},
						} ) }
						{ schedule?.args && (
							<Tooltip
								text={ preparePluginsTooltipInfo( schedule.args ) as unknown as string }
								delay={ 0 }
								hideOnClick={ false }
							>
								<Icon className="icon-info" icon={ info } size={ 16 } />
							</Tooltip>
						) }
					</Text>
				</div>
			</CardHeader>
			<CardBody>
				{ isPendingLogs && <Spinner /> }
				{ ! isPendingLogs && ! scheduleLogs.length && (
					<div className="empty-state">
						<Text align="center">{ translate( 'No logs available at the moment.' ) }</Text>
					</div>
				) }
			</CardBody>
			{ scheduleLogs.map( ( logs, i ) => (
				<Timeline key={ i }>
					{ logs.reverse().map( ( log, j ) => (
						<TimelineEvent
							key={ `${ log.timestamp }.${ j }` }
							date={ log.date }
							dateFormat={
								log.action === 'PLUGIN_UPDATES_START'
									? `${ dateFormat } ${ timeFormat }`
									: timeFormat
							}
							detail={ getLogDetails( log, plugins, siteSlug ) }
							icon={ getLogIcon( log ) }
							iconBackground={ getLogIconStatus( log ) }
							className={ shouldIndentTimelineEvent( log ) ? 'indent' : '' }
							disabled={ log.action === 'PLUGIN_UPDATES_START' }
							actionLabel={
								// show a button only for the most recent update failure
								i === 0 && log.action === 'PLUGIN_UPDATE_FAILURE'
									? translate( 'Try manual update' )
									: undefined
							}
							actionIsPrimary
							onActionClick={ goToPluginsPage }
						/>
					) ) }
				</Timeline>
			) ) }
		</Card>
	);
};
