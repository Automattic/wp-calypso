import { TLDMaintenanceNotice } from '../maintenance-notice';
import { DomainGlueRecordsLayout } from './layout';

export default function DomainGlueRecordsError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNotice error={ error }>
			{ ( { maintenanceNotice } ) => (
				<DomainGlueRecordsLayout isCtaDisabled notices={ maintenanceNotice } />
			) }
		</TLDMaintenanceNotice>
	);
}
