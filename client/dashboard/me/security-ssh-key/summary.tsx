import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecuritySshKeySummary() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/ssh-key"
			title={ __( 'SSH key' ) }
			description={ __(
				'Add a SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
			) }
			decoration={ <Icon icon={ key } /> }
		/>
	);
}
