import { tipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Notice } from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
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
			<Button
				variant="primary"
				__next40pxDefaultSize
				onClick={ () => {
					recordTracksEvent(
						'calypso_a4a_payout_status_notice_contact_support_click',
						eventProperties
					);
					openContactForm();
				} }
			>
				{ __( 'Contact support' ) }
			</Button>
		);
	} else if ( source === 'referrals' ) {
		actions = (
			<RouterLinkButton
				variant="primary"
				__next40pxDefaultSize
				to="/payout-settings"
				search={ backHereSearch }
				onClick={ () =>
					recordTracksEvent( 'calypso_a4a_payout_status_notice_add_details_click', eventProperties )
				}
			>
				{ __( 'Add my details' ) }
			</RouterLinkButton>
		);
	}

	return (
		<Notice variant={ accountStatus.statusType } actions={ actions }>
			{ accountStatus.statusReason }
		</Notice>
	);
}
