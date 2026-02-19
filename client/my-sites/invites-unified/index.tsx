import page from '@automattic/calypso-router';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import AcceptInviteScreen from './screens/accept-invite-screen';
import AlreadyMemberScreen from './screens/already-member-screen';
import { isAlreadyMemberError } from './utils';
import type { Invite, InviteBlogDetails, InviteError } from './types';

/**
 * Build the legacy invite path for fallback redirects
 */
function buildLegacyPath(
	siteId: string,
	inviteKey: string,
	...optionalKeys: ( string | undefined )[]
): string {
	const basePath = `/accept-invite/${ siteId }/${ inviteKey }`;
	const fullPath = optionalKeys
		.filter( Boolean )
		.reduce( ( path, key ) => `${ path }/${ key }`, basePath );
	return `${ fullPath }?legacy=1`;
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
	siteId,
	inviteKey,
	activationKey,
	authKey,
	inviteData,
	inviteError,
}: UnifiedInviteAcceptProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	// Redirect to legacy flow if not logged in (signup flow will be added later)
	if ( ! isLoggedIn ) {
		page.redirect( buildLegacyPath( siteId, inviteKey, activationKey, authKey ) );
		return null;
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
