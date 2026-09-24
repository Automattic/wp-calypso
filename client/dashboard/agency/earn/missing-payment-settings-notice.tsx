import { activeAgencyQuery, tipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

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

export default function MissingPaymentSettingsNotice( {
	hasCommissionActivity,
	commissionType,
}: MissingPaymentSettingsNoticeProps ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	// Dismissal is not persisted: the agency still has money waiting on these
	// details, so the notice comes back on the next visit.
	const [ isDismissed, setIsDismissed ] = useState( false );

	const { data: tipaltiData, isSuccess } = useQuery( {
		...tipaltiPayeeQuery( agencyId ),
		enabled: !! agencyId && hasCommissionActivity,
	} );

	if ( ! hasCommissionActivity || ! isSuccess || tipaltiData?.IsPayable || isDismissed ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Add your payout information to get paid.' ) }
			onClose={ () => setIsDismissed( true ) }
			actions={
				<RouterLinkButton variant="primary" to="/earn/payout-settings">
					{ __( 'Add payout information now' ) }
				</RouterLinkButton>
			}
		>
			{ getDescription( commissionType ) }
		</Notice>
	);
}
