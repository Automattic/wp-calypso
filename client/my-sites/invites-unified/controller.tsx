import { type Context } from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';
import { isAlreadyMemberError } from './utils';
import UnifiedInviteAccept from './index';
import type { InviteBlogDetails } from './types';

interface ApiError {
	error: string;
	message: string;
	data?: {
		garden_name?: string;
		garden_partner?: string;
	};
}

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
 * Build a minimal InviteBlogDetails from the error response's garden data.
 */
function getBlogDetailsFromError( apiError: ApiError ): InviteBlogDetails | undefined {
	const { garden_name, garden_partner } = apiError.data || {};
	if ( ! garden_name || ! garden_partner ) {
		return undefined;
	}

	return {
		is_garden_site: true,
		garden: { name: garden_name, partner: garden_partner },
	} as InviteBlogDetails;
}

/**
 * Middleware that checks if unified invite flow should be used.
 * Fetches invite data and delegates rendering to the unified component.
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
	} catch ( error: unknown ) {
		// Handle "already a member" errors in unified flow.
		// The error response may include garden data we use to determine if the site is CIAB.
		const apiError = error as ApiError;
		if ( apiError.error && isAlreadyMemberError( apiError.error ) ) {
			const blogDetails = getBlogDetailsFromError( apiError );

			if ( shouldUseUnifiedFlow( blogDetails ) ) {
				context.inviteError = {
					error: apiError.error,
					message: apiError.message,
				};
				context.inviteData = { blog_details: blogDetails };

				renderUnifiedInvite( context );
				context.useUnifiedInvite = true;
				return next();
			}
		}

		// On other errors, fallback to legacy flow (it handles errors gracefully)
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
			inviteError={ context.inviteError }
		/>
	);
}
