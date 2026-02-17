import page from '@automattic/calypso-router';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import AcceptInviteScreen from './screens/accept-invite-screen';
import type { Invite } from './types';

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
	inviteData: Record< string, unknown >;
}

export function UnifiedInviteAccept( {
	siteId,
	inviteKey,
	activationKey,
	authKey,
	inviteData,
}: UnifiedInviteAcceptProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	// Redirect to legacy flow if not logged in (signup flow will be added later)
	if ( ! isLoggedIn ) {
		page.redirect( buildLegacyPath( siteId, inviteKey, activationKey, authKey ) );
		return null;
	}

	const invite = { ...inviteData, inviteKey, activationKey } as Invite;

	return <AcceptInviteScreen invite={ invite } />;
}

export default UnifiedInviteAccept;
