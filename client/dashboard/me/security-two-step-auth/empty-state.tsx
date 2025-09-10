import { __ } from '@wordpress/i18n';
import { Icon, mobile } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecurityTwoStepAuthEmptyState() {
	return (
		<RouterLinkSummaryButton
			to="/me/security/two-step-auth/app"
			title={ __( 'Set up using an app' ) }
			description={ __( 'Use an app to generate two-step authentication codes.' ) }
			decoration={ <Icon icon={ mobile } /> }
		/>
	);
}
