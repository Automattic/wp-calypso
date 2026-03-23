import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function PreferencesPrivacy() {
	return (
		<RouterLinkSummaryButton
			to="/me/preferences/privacy"
			title={ __( 'Privacy' ) }
			description={ __( 'Manage your privacy settings and data sharing preferences.' ) }
			decoration={ <Icon icon={ shield } size={ 24 } /> }
		/>
	);
}
