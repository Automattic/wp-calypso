import { toError } from '../../utils/to-error';
import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { DomainGlueRecordsLayout } from './layout';

export default function DomainGlueRecordsError( { error }: { error: unknown } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ toError( error ) }>
			{ ( { maintenanceNotice } ) => (
				<DomainGlueRecordsLayout isCtaDisabled notices={ maintenanceNotice } />
			) }
		</TLDMaintenanceNoticeLayout>
	);
}
