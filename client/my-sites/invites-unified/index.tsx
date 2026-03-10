import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import normalizeInvite from 'calypso/my-sites/invites/invite-accept/utils/normalize-invite';
import LoggedOutInviteAccept from 'calypso/my-sites/invites/invite-accept-logged-out';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import AcceptInviteScreen from './screens/accept-invite-screen';
import AlreadyMemberScreen from './screens/already-member-screen';
import { isAlreadyMemberError } from './utils';
import type { Invite, InviteBlogDetails, InviteError } from './types';

interface LegacyLoggedOutInvite {
	inviteKey: string;
	activationKey?: string;
	authKey?: string;
	role: string;
	sentTo: string;
	knownUser?: boolean;
	forceMatchingEmail?: boolean;
	site: Record< string, unknown >;
}

interface UnifiedInviteAcceptProps {
	siteId: string;
	inviteKey: string;
	activationKey?: string;
	authKey?: string;
	inviteData?: Record< string, unknown >;
	inviteError?: InviteError;
}

export function UnifiedInviteAccept( {
	inviteKey,
	activationKey,
	authKey,
	inviteData,
	inviteError,
}: UnifiedInviteAcceptProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const legacyLoggedOutInvite = useMemo< LegacyLoggedOutInvite | null >( () => {
		if ( ! inviteData ) {
			return null;
		}

		const normalizedInvite = normalizeInvite( inviteData ) as LegacyLoggedOutInvite;

		return {
			...normalizedInvite,
			inviteKey,
			activationKey,
			authKey,
		};
	}, [ inviteData, inviteKey, activationKey, authKey ] );

	// Render logged-out invite signup in unified flow.
	if ( ! isLoggedIn ) {
		if ( ! legacyLoggedOutInvite ) {
			return null;
		}

		return <LoggedOutInviteAccept invite={ legacyLoggedOutInvite } forceMatchingEmail={ false } />;
	}

	// Already a member → show already-member screen
	if ( inviteError?.error && isAlreadyMemberError( inviteError.error ) ) {
		const blogDetails = ( inviteData as { blog_details?: InviteBlogDetails } )?.blog_details;
		return <AlreadyMemberScreen blogDetails={ blogDetails } />;
	}

	const invite = { ...inviteData, inviteKey, activationKey } as Invite;

	return <AcceptInviteScreen invite={ invite } />;
}

export default UnifiedInviteAccept;
