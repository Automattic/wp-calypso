import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lifesaver } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecurityAccountRecoverySummary() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/account-recovery"
			title={ __( 'Account recovery' ) }
			description={ __( 'Set up recovery email & SMS number' ) }
			decoration={ <Icon icon={ lifesaver } /> }
		/>
	);
}
