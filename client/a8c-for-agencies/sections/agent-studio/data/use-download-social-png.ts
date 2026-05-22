/**
 * `POST /a4a/collateral/<post_id>/social/<direction_id>/<size>/png` —
 * server-render a single Iris tile via Browserless, upload to the
 * portfolio blog, and cache the attachment id per
 * `(direction_id, size)`. First call wins; subsequent calls return the
 * cached URL verbatim, which is what guarantees downloaded social
 * assets stay pixel-stable across sessions.
 *
 * Caller hands us the already-fitted HTML (captured via
 * `captureFittedTileHtml`) plus the tile dimensions; the wpcom
 * endpoint cross-checks dimensions against the size enum.
 */
import wpcom from 'calypso/lib/wp';
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

export interface DownloadSocialPngResponse {
	url: string;
	attachment_id: number;
	cached: boolean;
}

export function downloadSocialPng(
	agencyId: number,
	args: DownloadSocialPngArgs
): Promise< DownloadSocialPngResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path:
			`/agency/${ agencyId }/a4a/collateral/${ args.postId }` +
			`/social/${ args.directionId }/${ args.size }/png`,
		body: {
			html: args.html,
			width: args.width,
			height: args.height,
		},
	} );
}

export default function useDownloadSocialPng() {
	const agencyId = useSelector( getActiveAgencyId );

	return async ( args: DownloadSocialPngArgs ): Promise< DownloadSocialPngResponse > => {
		if ( ! agencyId ) {
			throw new Error( 'useDownloadSocialPng: missing agencyId' );
		}
		return downloadSocialPng( agencyId, args );
	};
}
