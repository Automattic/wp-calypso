/**
 * `POST /a4a/collateral/<post_id>/social/<direction_id>/<size>/png` —
 * server-render a single Iris tile via Browserless and stream the
 * resulting PNG back inline as `image/png`. Nothing is persisted
 * server-side; the caller saves the returned Blob directly.
 *
 * Raw `fetch` (not `wpcom.req.post`) because the endpoint emits binary
 * `image/png` rather than JSON, and the wpcom-proxy-request iframe path
 * is JSON-only. Same pattern as `useAgentStudioVariantHtml` for the
 * sibling `/html` endpoint.
 *
 * Caller hands us the already-fitted HTML (captured via
 * `captureFittedTileHtml`) plus the tile dimensions; the wpcom
 * endpoint cross-checks dimensions against the size enum.
 */
import * as oauthToken from '@automattic/oauth-token';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface DownloadSocialPngArgs {
	postId: number;
	directionId: string;
	size: 'cover' | 'square' | 'story' | 'email';
	html: string;
	width: number;
	height: number;
}

export async function downloadSocialPng(
	agencyId: number,
	args: DownloadSocialPngArgs
): Promise< Blob > {
	const url =
		`https://public-api.wordpress.com/wpcom/v2/agency/${ agencyId }` +
		`/a4a/collateral/${ args.postId }` +
		`/social/${ args.directionId }/${ args.size }/png`;
	const token = oauthToken.getToken();

	const response = await fetch( url, {
		method: 'POST',
		headers: {
			Accept: 'image/png',
			'Content-Type': 'application/json',
			...( typeof token === 'string' ? { Authorization: `Bearer ${ token }` } : {} ),
		},
		body: JSON.stringify( {
			html: args.html,
			width: args.width,
			height: args.height,
		} ),
	} );

	if ( ! response.ok ) {
		// Errors come back as the usual WP_Error JSON envelope
		// (`{ code, message, data: { status } }`); fall back to the
		// status text when the body isn't parseable.
		let detail = response.statusText;
		try {
			const body = ( await response.json() ) as { code?: string; message?: string };
			if ( body?.message ) {
				detail = body.code ? `${ body.code }: ${ body.message }` : body.message;
			}
		} catch {
			// Non-JSON error body — keep the statusText fallback.
		}
		throw new Error( `POST social png ${ response.status }: ${ detail }` );
	}

	return response.blob();
}

export default function useDownloadSocialPng() {
	const agencyId = useSelector( getActiveAgencyId );

	return async ( args: DownloadSocialPngArgs ): Promise< Blob > => {
		if ( ! agencyId ) {
			throw new Error( 'useDownloadSocialPng: missing agencyId' );
		}
		return downloadSocialPng( agencyId, args );
	};
}
