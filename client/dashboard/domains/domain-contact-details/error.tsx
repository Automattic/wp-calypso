import { TLDMaintenanceNotice } from '../maintenance-notice';
import { DomainContactDetailsLayout } from './layout';

export default function DomainContactDetailsError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNotice error={ error }>
			{ ( { maintenanceNotice } ) => <DomainContactDetailsLayout notices={ maintenanceNotice } /> }
		</TLDMaintenanceNotice>
	);
}
