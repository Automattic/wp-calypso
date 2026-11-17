import { tipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import {
	Notice,
	NoticeActionButton,
	RouterNoticeActionLinkButton,
} from '../../../components/notice';
import { useBackHereSearch } from '../../components/fullscreen-page';
import { useContactSupport } from '../../support/use-contact-support';
import { getAccountStatus } from './get-account-status';

// Stays loading until the page knows whether the notice applies, so it doesn't pop in late.
export function usePayoutStatusNotice( {
	agencyId,
	enabled = true,
	isLoadingPage = false,
}: {
	agencyId: number;
	enabled?: boolean;
	isLoadingPage?: boolean;
} ) {
	const isEnabled = enabled && !! agencyId;
	const { data: payee, isLoading } = useQuery( {
		...tipaltiPayeeQuery( agencyId ),
		enabled: isEnabled,
	} );

	return {
		isEligible: isEnabled && !! getAccountStatus( payee )?.statusReason,
		isLoading: isLoadingPage || ( isEnabled && isLoading ),
	};
}

/**
 * Says why the agency can't be paid. Not Payable agencies are sent to add their
 * details, unless they are already on the page with the Tipalti form.
 */
export default function PayoutStatusNotice( {
	agencyId,
	source,
}: {
	agencyId: number;
	source: 'referrals' | 'payout_settings';
} ) {
	const { data: payee } = useQuery( tipaltiPayeeQuery( agencyId ) );
	const { recordTracksEvent } = useAnalytics();
	const { openContactForm } = useContactSupport();
	const backHereSearch = useBackHereSearch();
	const accountStatus = getAccountStatus( payee );

	if ( ! accountStatus?.statusReason ) {
		return null;
	}

	const eventProperties = { source, status: accountStatus.statusKey };

	let actions;
	if ( accountStatus.statusKey !== 'not_payable' ) {
		actions = (
			<NoticeActionButton
				variant="solid"
				onClick={ () => {
					recordTracksEvent(
						'calypso_a4a_payout_status_notice_contact_support_click',
						eventProperties
					);
					openContactForm();
				} }
			>
				{ __( 'Contact support' ) }
			</NoticeActionButton>
		);
	} else if ( source === 'referrals' ) {
		actions = (
			<RouterNoticeActionLinkButton
				variant="solid"
				to="/payout-settings"
				search={ backHereSearch }
				onClick={ () =>
					recordTracksEvent( 'calypso_a4a_payout_status_notice_add_details_click', eventProperties )
				}
			>
				{ __( 'Add my details' ) }
			</RouterNoticeActionLinkButton>
		);
	}

	return (
		<Notice variant={ accountStatus.statusType } actions={ actions }>
			{ accountStatus.statusReason }
		</Notice>
	);
}
