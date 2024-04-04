import { useUpdateScheduleLogsQuery } from 'calypso/data/plugins/use-update-schedule-logs-query';
import { useSiteSlug } from './hooks/use-site-slug';

interface Props {
	scheduleId: string;
	onNavBack?: () => void;
}
export const ScheduleLogs = ( props: Props ) => {
	const { scheduleId } = props;
	const siteSlug = useSiteSlug();

	const { data: logs = [] } = useUpdateScheduleLogsQuery( siteSlug, scheduleId );

	return (
		<>
			Schedule Logs: { scheduleId }
			<pre>{ JSON.stringify( logs, null, 4 ) }</pre>
		</>
	);
};
