import { activeAgencyQuery, tipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { isAgencyApproved } from '../marketplace/is-agency-approved';

type CommissionType = 'referrals' | 'migrations' | 'woopayments';

interface MissingPaymentSettingsNoticeProps {
	hasCommissionActivity: boolean;
	commissionType?: CommissionType;
}

function getDescription( commissionType?: CommissionType ) {
	switch ( commissionType ) {
		case 'referrals':
			return __(
				'You’ve successfully made a client referral and will be due future commissions. Add your payment details to get paid.'
			);
		case 'migrations':
			return __(
				'You have successfully migrated a site and will be due future commissions. Add your payment details to get paid.'
			);
		default:
			return __(
				'Ensure you receive your share of revenue by providing your payout details in the payout settings screen.'
			);
	}
}

// Stays loading until the commission activity is known, so the notice doesn't pop in late.
export function useMissingPaymentSettings( {
	hasCommissionActivity,
	isLoadingActivity = false,
}: {
	hasCommissionActivity: boolean;
	isLoadingActivity?: boolean;
} ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	// Payout settings stay closed until the agency is approved, so there is nowhere to send it.
	const enabled = !! agencyId && isAgencyApproved( agency ) && hasCommissionActivity;
	const {
		data: tipaltiData,
		isSuccess,
		isLoading,
	} = useQuery( {
		...tipaltiPayeeQuery( agencyId ),
		enabled,
	} );

	return {
		isEligible: enabled && isSuccess && ! tipaltiData?.IsPayable,
		isLoading: isLoadingActivity || ( enabled && isLoading ),
	};
}

export default function MissingPaymentSettingsNotice( {
	hasCommissionActivity,
	commissionType,
}: MissingPaymentSettingsNoticeProps ) {
	const { isEligible } = useMissingPaymentSettings( { hasCommissionActivity } );

	if ( ! isEligible ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Add your payout information to get paid.' ) }
			actions={
				<RouterLinkButton variant="primary" to="/payout-settings">
					{ __( 'Add payout information now' ) }
				</RouterLinkButton>
			}
		>
			{ getDescription( commissionType ) }
		</Notice>
	);
}
