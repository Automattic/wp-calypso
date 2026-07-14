import {
	activeAgencyQuery,
	tipaltiPayeeQuery,
	userPreferenceQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

// Payout settings live in the classic A4A app, which is outside the dashboard.
const A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK = '/woopayments/payment-settings';
const DISMISS_PREFERENCE = 'a4a-missing-payment-settings-notice-dismissed';

interface MissingPaymentSettingsNoticeProps {
	hasSites: boolean;
}

export default function MissingPaymentSettingsNotice( {
	hasSites,
}: MissingPaymentSettingsNoticeProps ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: tipaltiData, isSuccess } = useQuery( {
		...tipaltiPayeeQuery( agencyId ),
		enabled: !! agencyId && hasSites,
	} );

	const { data: dismissedAt } = useQuery( userPreferenceQuery( DISMISS_PREFERENCE ) );
	const { mutate: dismissNotice } = useMutation( userPreferenceMutation( DISMISS_PREFERENCE ) );

	if ( ! hasSites || ! isSuccess || tipaltiData?.IsPayable || dismissedAt ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Add your payout information to get paid.' ) }
			onClose={ () => dismissNotice( new Date().toISOString() ) }
			actions={
				<Button variant="primary" href={ A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK }>
					{ __( 'Add payout information now' ) }
				</Button>
			}
		>
			{ __(
				'Ensure you receive your share of revenue by providing your payout details in the payout settings screen.'
			) }
		</Notice>
	);
}
