import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { commentAuthorAvatar } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecuritySocialLoginsSummary() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/social-logins"
			title={ __( 'Social logins' ) }
			description={ __( 'Log in faster with the accounts you already use.' ) }
			decoration={ <Icon icon={ commentAuthorAvatar } /> }
		/>
	);
}
