import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { notAllowed } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function PreferencesBlockedSites() {
	return (
		<RouterLinkSummaryButton
			to="/me/preferences/blocked-sites"
			title={ __( 'Blocked sites' ) }
			description={ __( 'Manage your list of blocked sites in the Reader.' ) }
			decoration={ <Icon icon={ notAllowed } size={ 24 } /> }
		/>
	);
}
