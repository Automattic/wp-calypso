import { toError } from '../../utils/to-error';
import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { DomainContactDetailsLayout } from './layout';

export default function DomainContactDetailsError( { error }: { error: unknown } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ toError( error ) }>
			{ ( { maintenanceNotice } ) => <DomainContactDetailsLayout notices={ maintenanceNotice } /> }
		</TLDMaintenanceNoticeLayout>
	);
}
