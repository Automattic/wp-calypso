import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecurityAccountRecoverySummary() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/connected-apps"
			title={ __( 'Connected applications' ) }
			description={ __( 'Manage applications connected to your WordPress.com account.' ) }
			decoration={ <Icon icon={ connection } /> }
		/>
	);
}
