import { ScheduleForm } from './schedule-form';

type Props = {
	onNavBack?: () => void;
};

export const ScheduleCreate = ( { onNavBack }: Props ) => {
	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<h1 className="wp-brand-font">New schedule</h1>
			<ScheduleForm onNavBack={ onNavBack } />
		</div>
	);
};
