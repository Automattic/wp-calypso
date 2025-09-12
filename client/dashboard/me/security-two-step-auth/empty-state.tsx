import { __ } from '@wordpress/i18n';
import { Icon, mobile, comment } from '@wordpress/icons';
import { Notice } from '../../components/notice';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function SecurityTwoStepAuthEmptyState( {
	isEnforcedByOrganization,
}: {
	isEnforcedByOrganization: boolean;
} ) {
	return (
		<>
			{ isEnforcedByOrganization && (
				<Notice variant="info" title={ __( 'Enforced by your organization' ) }>
					{ __(
						'Two-step authentication is required by your organization to keep your account secure.'
					) }
				</Notice>
			) }
			<RouterLinkSummaryButton
				to="/me/security/two-step-auth/app"
				title={ __( 'Set up using an app' ) }
				description={ __( 'Use an app to generate two-step authentication codes.' ) }
				decoration={ <Icon icon={ mobile } /> }
			/>
			<RouterLinkSummaryButton
				to="/me/security/two-step-auth/sms"
				title={ __( 'Set up using SMS' ) }
				description={ __( 'Receive two-step authentication codes by text message.' ) }
				decoration={ <Icon icon={ comment } /> }
			/>
		</>
	);
}
