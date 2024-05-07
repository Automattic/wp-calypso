import { Button } from '@wordpress/components';
import { close, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ScheduleForm } from './schedule-form';

type Props = {
	onNavBack?: () => void;
};

export const ScheduleCreate = ( { onNavBack }: Props ) => {
	const translate = useTranslate();
	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<div className="plugins-update-manager-multisite__header no-border">
				<h1 className="wp-brand-font">{ translate( 'New schedule' ) }</h1>
				<Button onClick={ onNavBack }>
					<Icon icon={ close } />
				</Button>
			</div>
			<ScheduleForm onNavBack={ onNavBack } />
		</div>
	);
};
