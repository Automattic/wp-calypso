import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { DomainContactDetailsLayout } from './layout';

export default function DomainContactDetailsError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ error }>
			{ ( { maintenanceNotice } ) => <DomainContactDetailsLayout notices={ maintenanceNotice } /> }
		</TLDMaintenanceNoticeLayout>
	);
}
