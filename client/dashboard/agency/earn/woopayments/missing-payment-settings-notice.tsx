import { activeAgencyQuery, agencyTipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

// Payout settings live in the classic A4A app, which is outside the dashboard.
const A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK = '/woopayments/payment-settings';

interface MissingPaymentSettingsNoticeProps {
	hasSites: boolean;
}

export default function MissingPaymentSettingsNotice( {
	hasSites,
}: MissingPaymentSettingsNoticeProps ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: tipaltiData, isSuccess } = useQuery( {
		...agencyTipaltiPayeeQuery( agencyId ),
		enabled: !! agencyId && hasSites,
	} );

	if ( ! hasSites || ! isSuccess || tipaltiData?.IsPayable ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Add your payout information to get paid.' ) }
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
