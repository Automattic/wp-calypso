import { ScheduleForm } from './schedule-form';

export const ScheduleCreate = () => {
	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<h1 className="wp-brand-font">Weekly on Monday at 10AM</h1>

			<ScheduleForm />
		</div>
	);
};
