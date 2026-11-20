import { addQueryArgs } from '@wordpress/url';

export const STUDIO_RETURN_PATH = '/checkout/studio-return';

// Studio's own identifiers, which we echo back rather than interpret. We bound the length and leave
// the format to Studio — asserting a format here would silently kill the handoff the day Studio
// changes one. Safety comes from `addQueryArgs` percent-encoding the values, so a hostile one cannot
// inject into the `wp-studio://` URL.
const STUDIO_ID_MAX_LENGTH = 64;

function isUsableStudioId( value: unknown ): value is string {
	// Repeated params (`?studioSiteId=a&studioSiteId=b`) parse to an array rather than a string.
	return typeof value === 'string' && value.length > 0 && value.length <= STUDIO_ID_MAX_LENGTH;
}

export interface StudioCheckoutParams {
	studioSiteId: string;
	studioReturnTo?: string;
}

/**
 * Reads the Studio params off a checkout URL, or returns null if this is not a Studio checkout.
 *
 * `studioSiteId` alone is the trigger. It is deliberately not gated on `ref=studio`: `ref` is a
 * generic attribution param that a dozen unrelated features also read, whereas `studioSiteId`
 * appears only in the two Studio integrations.
 */
export function getStudioCheckoutParams(
	query: Record< string, unknown > | undefined
): StudioCheckoutParams | null {
	const studioSiteId = query?.studioSiteId;

	if ( ! isUsableStudioId( studioSiteId ) ) {
		return null;
	}

	const studioReturnTo = query?.studioReturnTo;

	return {
		studioSiteId,
		...( isUsableStudioId( studioReturnTo ) ? { studioReturnTo } : {} ),
	};
}

function parseSiteId( value: unknown ): number | null {
	if ( typeof value !== 'string' || ! /^[1-9]\d*$/.test( value ) ) {
		return null;
	}
	const siteId = Number( value );
	return Number.isSafeInteger( siteId ) ? siteId : null;
}

export interface StudioSyncConnectParams {
	studioSiteId: string;
	remoteSiteId: number;
	autoOpenPush: boolean;
}

export type StudioSyncConnectRejection = 'site_id' | 'studio_site_id';

/**
 * Reads the params of Studio's publish flow off a `/checkout/studio-return` URL, or returns null
 * when the URL belongs to the checkout round trip instead.
 *
 * `remoteSiteId` alone picks this mode, whatever its value. A malformed link is rejected rather
 * than handled as a cancelled checkout, which would hand Studio the wrong result.
 */
export function getStudioSyncConnectParams(
	query: Record< string, unknown > | undefined
):
	| { params: StudioSyncConnectParams; rejection?: never }
	| { params?: never; rejection: StudioSyncConnectRejection }
	| null {
	if ( ! query || ! ( 'remoteSiteId' in query ) ) {
		return null;
	}

	const remoteSiteId = parseSiteId( query.remoteSiteId );
	if ( ! remoteSiteId ) {
		return { rejection: 'site_id' };
	}

	const studioSiteId = query.studioSiteId;
	if ( ! isUsableStudioId( studioSiteId ) ) {
		return { rejection: 'studio_site_id' };
	}

	return {
		params: { studioSiteId, remoteSiteId, autoOpenPush: query.autoOpenPush === 'true' },
	};
}

/**
 * The query both the landing path and Studio's `sync-connect-site` deep link carry.
 */
export function toStudioSyncConnectQuery( {
	studioSiteId,
	remoteSiteId,
	autoOpenPush,
}: StudioSyncConnectParams ): Record< string, string | number > {
	return {
		studioSiteId,
		remoteSiteId,
		...( autoOpenPush ? { autoOpenPush: 'true' } : {} ),
	};
}

/**
 * Where Studio's publish flow should land once the new site is ready, so the page can connect it
 * to the local site.
 */
export function buildStudioSyncConnectPath( params: StudioSyncConnectParams ): string {
	return addQueryArgs( STUDIO_RETURN_PATH, toStudioSyncConnectQuery( params ) );
}

/**
 * Where checkout should send the user after a successful purchase.
 *
 * The real thank-you page, so that a failed handoff still leaves the user with their receipt. The
 * `:receiptId` placeholder is interpolated downstream — by `getThankYouPageUrl` for immediate
 * payments, and by the pending page for redirect methods like PayPal.
 */
export function buildStudioRedirectTo(
	siteSlug: string | undefined,
	{ studioSiteId, studioReturnTo }: StudioCheckoutParams
): string {
	return addQueryArgs( `/checkout/thank-you/${ siteSlug || 'no-site' }/:receiptId`, {
		studioSiteId,
		...( studioReturnTo ? { studioReturnTo } : {} ),
	} );
}

/**
 * Where checkout should send the user when they back out.
 *
 * A dedicated page rather than the thank-you page, because there is no receipt to show.
 */
export function buildStudioCancelTo( {
	studioSiteId,
	studioReturnTo,
}: StudioCheckoutParams ): string {
	return addQueryArgs( STUDIO_RETURN_PATH, {
		studioSiteId,
		...( studioReturnTo ? { studioReturnTo } : {} ),
	} );
}
