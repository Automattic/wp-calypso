import { type Context } from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';
import UnifiedInviteAccept from './index';
import type { InviteBlogDetails } from './types';

/**
 * Determine if unified invite flow should be used
 * Currently enabled for CIAB sites or when ?unified=1 is present
 */
function shouldUseUnifiedFlow( blogDetails?: InviteBlogDetails ): boolean {
	// Check for force flags in URL
	const forceUnified = getQueryArg( window.location.href, 'unified' ) === '1';
	const forceLegacy = getQueryArg( window.location.href, 'legacy' ) === '1';

	if ( forceLegacy ) {
		return false;
	}

	if ( forceUnified ) {
		return true;
	}

	// Enable for CIAB (Commerce Garden) sites
	return Boolean(
		blogDetails?.is_garden_site &&
			blogDetails?.garden?.partner === 'woo' &&
			blogDetails?.garden?.name === 'commerce'
	);
}

/**
 * Middleware that checks if unified invite flow should be used
 * If unified should be used, renders the unified UI and sets a flag to skip legacy controller
 * Otherwise, calls next() to let the legacy acceptInvite controller run
 */
export async function maybeUseUnifiedInvite( context: Context, next: () => void ) {
	const { site_id: siteId, invitation_key: inviteKey } = context.params;

	// Check for legacy flag first - skip unified entirely
	const forceLegacy = getQueryArg( window.location.href, 'legacy' ) === '1';
	if ( forceLegacy ) {
		return next();
	}

	try {
		// Fetch invite data to determine site type
		const response = await wpcom.req.get( `/sites/${ siteId }/invites/${ inviteKey }` );
		context.inviteData = response;

		if ( shouldUseUnifiedFlow( response?.blog_details ) ) {
			renderUnifiedInvite( context );
			context.useUnifiedInvite = true;
		}

		return next();
	} catch {
		// On error, fallback to legacy flow (it handles errors gracefully)
		return next();
	}
}

/**
 * Render the unified invite accept component
 */
function renderUnifiedInvite( context: Context ) {
	const {
		site_id: siteId,
		invitation_key: inviteKey,
		activation_key: activationKey,
		auth_key: authKey,
	} = context.params;

	context.primary = (
		<UnifiedInviteAccept
			siteId={ siteId }
			inviteKey={ inviteKey }
			activationKey={ activationKey }
			authKey={ authKey }
			inviteData={ context.inviteData }
		/>
	);
}
