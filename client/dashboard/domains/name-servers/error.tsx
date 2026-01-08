import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { NameServersLayout } from './layout';

export default function NameServersError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ error }>
			{ ( { maintenanceNotice } ) => <NameServersLayout notices={ maintenanceNotice } /> }
		</TLDMaintenanceNoticeLayout>
	);
}
