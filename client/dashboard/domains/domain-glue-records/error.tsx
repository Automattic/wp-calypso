import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { DomainGlueRecordsLayout } from './layout';

export default function DomainGlueRecordsError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ error }>
			{ ( { maintenanceNotice } ) => (
				<DomainGlueRecordsLayout isCtaDisabled notices={ maintenanceNotice } />
			) }
		</TLDMaintenanceNoticeLayout>
	);
}
