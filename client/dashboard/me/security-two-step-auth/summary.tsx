import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { mobile } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecurityTwoStepAuthSummary() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/two-step-auth"
			title={ __( 'Two-step authentication' ) }
			description={ __( 'Manage two-step authentication and security keys and backup codes.' ) }
			decoration={ <Icon icon={ mobile } /> }
		/>
	);
}
