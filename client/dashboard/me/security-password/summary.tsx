import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lockOutline } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecurityAccountRecoverySummary() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/password"
			title={ __( 'Password' ) }
			description={ __( 'Strengthen your account by ensuring your password is strong.' ) }
			decoration={ <Icon icon={ lockOutline } /> }
		/>
	);
}
