import {
	tipaltiPayeeQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { Notice } from '../../../components/notice';
import { getAccountStatus } from '../payout-settings/get-account-status';

// Shared with the classic A4A dashboard so the notice only shows once across both.
const SEEN_PREFERENCE = 'a4a-referrals-bank-details-success-notice-seen';

/**
 * Confirms, once, that Tipalti accepted the agency's bank and tax details. It
 * only has a place before the first referral: after that the payout cards carry
 * the account status.
 */
export default function BankDetailsNotice( { agencyId }: { agencyId: number } ) {
	const { data: payee } = useQuery( tipaltiPayeeQuery( agencyId ) );
	const { data: hasSeenNotice, isFetched } = useQuery( userPreferenceQuery( SEEN_PREFERENCE ) );
	const { mutate: saveSeen } = useMutation( userPreferenceMutation( SEEN_PREFERENCE ) );

	const [ isDismissed, setIsDismissed ] = useState( false );
	// Saving the preference flips `hasSeenNotice`, which would hide the notice
	// before it had been read. This keeps it up for the rest of the visit.
	const [ wasUnseen, setWasUnseen ] = useState( false );

	const isConfirmed = getAccountStatus( payee )?.statusType === 'success';

	useEffect( () => {
		if ( isConfirmed && isFetched && ! hasSeenNotice ) {
			setWasUnseen( true );
			saveSeen( true );
		}
	}, [ isConfirmed, isFetched, hasSeenNotice, saveSeen ] );

	if ( ! isConfirmed || ! wasUnseen || isDismissed ) {
		return null;
	}

	return (
		<Notice variant="success" onClose={ () => setIsDismissed( true ) }>
			{ __(
				'Thanks for entering your bank and tax information. Our team will confirm and review your submission.'
			) }
		</Notice>
	);
}
