import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { ContactDetailsLayout } from './layout';

export default function ContactDetailsError( { error }: { error: Error } ) {
	return (
		<TLDMaintenanceNoticeLayout error={ error }>
			{ ( { maintenanceNotice } ) => (
				<ContactDetailsLayout notices={ maintenanceNotice } isCtaDisabled>
					<div>{ /* Empty content for error state */ }</div>
				</ContactDetailsLayout>
			) }
		</TLDMaintenanceNoticeLayout>
	);
}
