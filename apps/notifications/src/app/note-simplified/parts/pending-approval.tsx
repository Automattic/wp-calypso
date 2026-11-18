import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';

export default function PendingApproval() {
	return (
		<Badge className="wpnc__pending-badge" intent="medium">
			{ __( 'Pending' ) }
		</Badge>
	);
}
