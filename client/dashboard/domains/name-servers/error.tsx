import { TLDMaintenanceNotice } from '../maintenance-notice';
import { NameServersLayout } from './layout';

export default function NameServersError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNotice error={ error }>
			{ ( { maintenanceNotice } ) => <NameServersLayout notices={ maintenanceNotice } /> }
		</TLDMaintenanceNotice>
	);
}
