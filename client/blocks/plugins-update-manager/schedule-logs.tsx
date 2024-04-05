import {
	__experimentalText as Text,
	Button,
	Card,
	CardHeader,
	Tooltip,
} from '@wordpress/components';
import { arrowLeft, Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Timeline from 'calypso/components/timeline';
import TimelineEvent from 'calypso/components/timeline/timeline-event';
import {
	type ScheduleUpdates,
	useUpdateScheduleQuery,
} from 'calypso/data/plugins/use-update-schedules-query';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { usePreparePluginsTooltipInfo } from './hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from './hooks/use-prepare-schedule-name';
import { useSiteAdminUrl } from './hooks/use-site-admin-url';
import { useSiteDateTimeFormat } from './hooks/use-site-date-time-format';
import { useSiteSlug } from './hooks/use-site-slug';

interface Props {
	scheduleId: string;
	onNavBack?: () => void;
}
export const ScheduleLogs = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { scheduleId, onNavBack } = props;

	const siteAdminUrl = useSiteAdminUrl();
	const {
		dateFormat: phpDateFormat,
		timeFormat: phpTimeFormat,
		convertPhpToMomentFormat,
	} = useSiteDateTimeFormat( siteSlug );
	const dateFormat = convertPhpToMomentFormat( phpDateFormat );
	const timeFormat = convertPhpToMomentFormat( phpTimeFormat );
	const { prepareScheduleName } = usePrepareScheduleName();
	const { preparePluginsTooltipInfo } = usePreparePluginsTooltipInfo( siteSlug );
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const {
		data: schedules = [],
		isFetched,
		isPending,
	} = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const schedule = schedules.find( ( s ) => s.id === scheduleId );

	const goToPluginsPage = useCallback( () => {
		window.location.href = `${ siteAdminUrl }plugins.php`;
	}, [ siteAdminUrl ] );

	if ( isPending ) {
		return null;
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
					<Text isBlock={ true } align="end" lineHeight={ 2.5 }>
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
			<Timeline>
				<TimelineEvent
					date={ new Date( '30 March 2024, 10:01 am' ) }
					dateFormat={ timeFormat }
					detail="Plugins update completed"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					className="indent"
					date={ new Date( '30 March 2024, 10:00:48 am' ) }
					dateFormat={ timeFormat }
					detail="Gravity Forms updated from 2.5.8 to 2.6.0"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					className="indent"
					date={ new Date( '30 March 2024, 10:00:39 am' ) }
					dateFormat={ timeFormat }
					detail="Move to WordPress.com update from 5.9.3 to 6.0.0 failed [ Rolledback to 5.9.3 ]"
					icon="cross"
					iconBackground="error"
					actionLabel="Try manual update"
					actionIsPrimary={ true }
					onActionClick={ goToPluginsPage }
				/>
				<TimelineEvent
					className="indent"
					date={ new Date( '30 March 2024, 10:00:12 am' ) }
					dateFormat={ timeFormat }
					detail="Elementor Pro updated from 3.0.9 to 3.1.0"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					date={ new Date( '30 March 2024' ) }
					dateFormat={ `${ dateFormat } ${ timeFormat }` }
					detail="Plugins update starts"
					icon="sync"
					disabled
				/>
			</Timeline>
			<Timeline>
				<TimelineEvent
					date={ new Date( '27 March 2024, 10:01 am' ) }
					dateFormat={ timeFormat }
					detail="Plugins update completed successfully"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					className="indent"
					date={ new Date( '27 March 2024, 10:00:48 am' ) }
					dateFormat={ timeFormat }
					detail="Gravity Forms updated from 2.5.8 to 2.6.0"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					className="indent"
					date={ new Date( '27 March 2024, 10:00:39 am' ) }
					dateFormat={ timeFormat }
					detail="Move to WordPress.com update from 5.9.3 to 6.0.0"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					className="indent"
					date={ new Date( '27 March 2024, 10:00:12 am' ) }
					dateFormat={ timeFormat }
					detail="Elementor Pro updated from 3.0.9 to 3.1.0"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					date={ new Date( '27 March 2024, 10:00:00 am' ) }
					dateFormat={ `${ dateFormat } ${ timeFormat }` }
					detail="Plugins update starts"
					icon="sync"
					disabled
				/>
			</Timeline>
		</Card>
	);
};
