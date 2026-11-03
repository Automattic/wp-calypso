import { isEnabled } from '@automattic/calypso-config';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import DashboardOptInModal from 'calypso/a8c-for-agencies/components/dashboard-opt-in-modal';
import useFetchActiveMembers from 'calypso/a8c-for-agencies/data/team/use-fetch-active-members';
import useDashboardOptIn from 'calypso/a8c-for-agencies/hooks/use-dashboard-opt-in';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency, isAgencyOwner } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

const DISMISS_PREFERENCE = 'a4a-dashboard-opt-in-invitation-dismissed';
// The `updated_at` of the switch back the user has already been told about.
const SWITCHED_BACK_NOTE_PREFERENCE = 'a4a-dashboard-switched-back-note-seen';
const NOTE_ID = 'a4a-dashboard-opt-in-note';
const OWNER_ROLE = 'a4a_administrator';

/**
 * Tells everyone on the team once that the agency switched back to this dashboard.
 */
function useSwitchedBackNote() {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const isOwner = useSelector( isAgencyOwner );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const seenAt = useSelector( ( state ) => getPreference( state, SWITCHED_BACK_NOTE_PREFERENCE ) );
	const optIn = agency?.dashboard_opt_in;
	const switchedBackAt = optIn?.value === 'opt-out' ? optIn.updated_at : '';
	const isNoteDue =
		isEnabled( 'a4a-dashboard-opt-in' ) &&
		hasPreferences &&
		!! switchedBackAt &&
		seenAt !== switchedBackAt;
	// Team members are told who switched back, so they know who to ask. The team list is only
	// fetched when that note is about to show.
	const { data: members, isPending: isMembersPending } = useFetchActiveMembers( {
		enabled: isNoteDue && ! isOwner,
	} );
	const ownerName = members?.find( ( member ) => member.role === OWNER_ROLE )?.displayName;

	useEffect( () => {
		if ( ! isNoteDue ) {
			return;
		}
		// Wait for the team list so the owner's name can be included. If it fails, the
		// note goes out without it.
		if ( ! isOwner && isMembersPending ) {
			return;
		}
		let message: string = __(
			'Your agency owner switched back to the classic dashboard. Reach out to them if you’d like to try the new dashboard again.'
		);
		if ( isOwner ) {
			message = __(
				'You’re back on the classic dashboard. You can enable the new dashboard again any time from Helpful links on this page.'
			);
		} else if ( ownerName ) {
			message = sprintf(
				/* translators: %s: the agency owner's name */
				__(
					'Your agency owner %s switched back to the classic dashboard. Reach out to them if you’d like to try the new dashboard again.'
				),
				ownerName
			);
		}
		dispatch( successNotice( message, { id: NOTE_ID, duration: 10000 } ) );
		dispatch( savePreference( SWITCHED_BACK_NOTE_PREFERENCE, switchedBackAt ) );
	}, [ dispatch, isMembersPending, isNoteDue, isOwner, ownerName, switchedBackAt ] );
}

/**
 * The invitation on Overview: the modal on the owner's first visit. Helpful links
 * reopens it at any time through `getDashboardOptInLink`.
 */
export default function DashboardOptInInvitation() {
	const dispatch = useDispatch();
	const { canOptIn } = useDashboardOptIn();
	const agency = useSelector( getActiveAgency );
	// Only an agency that has never made a choice gets the modal on its own; one that
	// switched back gets the note instead, and can reopen the modal from Helpful links.
	const hasNeverChosen = ( agency?.dashboard_opt_in?.value ?? 'unset' ) === 'unset';
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => !! getPreference( state, DISMISS_PREFERENCE ) );
	useSwitchedBackNote();

	if ( canOptIn && hasNeverChosen && hasPreferences && ! isDismissed ) {
		return (
			<DashboardOptInModal
				source="overview"
				onClose={ () => {
					dispatch( savePreference( DISMISS_PREFERENCE, true ) );
					dispatch(
						successNotice(
							__( 'You can enable the new dashboard any time from Helpful links on this page.' ),
							{
								id: NOTE_ID,
								duration: 10000,
							}
						)
					);
				} }
			/>
		);
	}

	return null;
}
