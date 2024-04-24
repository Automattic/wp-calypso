import { useUpdateSchedulesQuery } from 'calypso/data/plugins/use-update-schedules-query';

export const ScheduleList = () => {
	const { data } = useUpdateSchedulesQuery( true );

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<h1 className="wp-brand-font">List schedules</h1>
			<pre>{ JSON.stringify( data, null, 4 ) }</pre>
		</div>
	);
};
