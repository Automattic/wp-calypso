import { activeAgencyQuery, tipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

interface MissingPaymentSettingsNoticeProps {
	hasCommissionActivity: boolean;
}

export default function MissingPaymentSettingsNotice( {
	hasCommissionActivity,
}: MissingPaymentSettingsNoticeProps ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: tipaltiData, isSuccess } = useQuery( {
		...tipaltiPayeeQuery( agencyId ),
		enabled: !! agencyId && hasCommissionActivity,
	} );

	if ( ! hasCommissionActivity || ! isSuccess || tipaltiData?.IsPayable ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Add your payout information to get paid.' ) }
			actions={
				<RouterLinkButton variant="primary" to="/earn/payout-settings">
					{ __( 'Add payout information now' ) }
				</RouterLinkButton>
			}
		>
			{ __(
				'Ensure you receive your share of revenue by providing your payout details in the payout settings screen.'
			) }
		</Notice>
	);
}
