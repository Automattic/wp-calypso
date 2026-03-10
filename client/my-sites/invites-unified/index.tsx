import { Step } from '@automattic/onboarding';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getCiabConfigFromGarden } from 'calypso/lib/partner-branding';
import normalizeInvite from 'calypso/my-sites/invites/invite-accept/utils/normalize-invite';
import LoggedOutInviteAccept from 'calypso/my-sites/invites/invite-accept-logged-out';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import AcceptInviteScreen from './screens/accept-invite-screen';
import AlreadyMemberScreen from './screens/already-member-screen';
import { isAlreadyMemberError } from './utils';
import type { Invite, InviteBlogDetails, InviteError } from './types';

import './style.scss';

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
	const blogDetails = ( inviteData as { blog_details?: InviteBlogDetails } )?.blog_details;
	const branding =
		blogDetails?.is_garden_site && blogDetails.garden
			? getCiabConfigFromGarden( blogDetails.garden.partner, blogDetails.garden.name, {
					persistToSession: true,
			  } )
			: null;
	const topBarLogoConfig = branding?.compactLogo ?? branding?.logo;
	const topBarLogo = topBarLogoConfig?.src ? (
		<img { ...topBarLogoConfig } alt={ topBarLogoConfig.alt } />
	) : undefined;
	const legacyLoggedOutInvite = useMemo< LegacyLoggedOutInvite | null >( () => {
		if ( isLoggedIn || ! inviteData || ! ( inviteData as { invite?: unknown } ).invite ) {
			return null;
		}

		const normalizedInvite = normalizeInvite( inviteData ) as LegacyLoggedOutInvite;

		return {
			...normalizedInvite,
			inviteKey,
			activationKey,
			authKey,
		};
	}, [ isLoggedIn, inviteData, inviteKey, activationKey, authKey ] );

	// Render logged-out invite signup in unified flow.
	if ( ! isLoggedIn ) {
		if ( ! legacyLoggedOutInvite ) {
			return null;
		}

		return (
			<div className="invites-unified__logged-out-layout">
				<Step.TopBar logo={ topBarLogo } />
				<div className="invites-unified__logged-out-shell">
					<LoggedOutInviteAccept invite={ legacyLoggedOutInvite } forceMatchingEmail={ false } />
				</div>
			</div>
		);
	}

	// Already a member → show already-member screen
	if ( inviteError?.error && isAlreadyMemberError( inviteError.error ) ) {
		return <AlreadyMemberScreen blogDetails={ blogDetails } />;
	}

	const invite = { ...inviteData, inviteKey, activationKey } as Invite;

	return <AcceptInviteScreen invite={ invite } />;
}

export default UnifiedInviteAccept;
