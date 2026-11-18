import { toError } from '../../utils/to-error';
import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { NameServersLayout } from './layout';

export default function NameServersError( { error }: { error: unknown } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ toError( error ) }>
			{ ( { maintenanceNotice } ) => <NameServersLayout notices={ maintenanceNotice } /> }
		</TLDMaintenanceNoticeLayout>
	);
}
