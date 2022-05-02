import { isAnchorPodcastIdValid } from './use-is-anchor-fm';
import useParameter from './use-parameter';

export interface AnchorFmParams {
	anchorFmPodcastId: string | null;
	anchorFmEpisodeId: string | null;
	anchorFmSpotifyUrl: string | null;
	anchorFmSite: string | null;
	anchorFmPost: string | null;
	anchorFmIsNewSite: string | null;
	isAnchorFmPodcastIdError: boolean;
}
export function useAnchorFmParams(): AnchorFmParams {
	const sanitizePodcast = ( id: string ) => id.replace( /[^a-zA-Z0-9]/g, '' );
	const anchorFmPodcastId = useParameter( {
		queryParamName: 'anchor_podcast',
		locationStateParamName: 'anchorFmPodcastId',
		sanitize: sanitizePodcast,
	} );
	const isAnchorFmPodcastIdError =
		anchorFmPodcastId !== null && ! isAnchorPodcastIdValid( anchorFmPodcastId );

	// Allow all characters allowed in urls
	// Reserved characters: !*'();:@&=+$,/?#[]
	// Unreserved: A-Za-z0-9_.~-    (possibly % as a part of percent-encoding)
	const sanitizeEpisode = ( id: string ) => id.replace( /[^A-Za-z0-9_.\-~%]/g, '' );
	const anchorFmEpisodeId = useParameter( {
		queryParamName: 'anchor_episode',
		locationStateParamName: 'anchorFmEpisodeId',
		sanitize: sanitizeEpisode,
	} );

	// Allow all characters allowed in urls
	// Reserved characters: !*'();:@&=+$,/?#[]
	// Unreserved: A-Za-z0-9_.~-    (possibly % as a part of percent-encoding)
	const sanitizeShowUrl = ( id: string ) =>
		id.replace( /[^A-Za-z0-9_.\-~%!*'();:@&=+$,/?#[\]]/g, '' );
	const anchorFmSpotifyUrl = useParameter( {
		queryParamName: 'spotify_url',
		locationStateParamName: 'anchorFmSpotifyUrl',
		sanitize: sanitizeShowUrl,
	} );

	// "site" and "post" are strings consisting of digits only. Example URL:
	// http://wordpress.com/new?site=181129564&post=5&anchor_podcast=22b6608
	// We store them as strings for consistency with the other param types
	// and simplicity in code and type signatures.
	const sanitizeNumberParam = ( id: string ) => id.replace( /^\D+$/g, '' );
	const anchorFmSite = useParameter( {
		queryParamName: 'site',
		locationStateParamName: 'anchorFmSite',
		sanitize: sanitizeNumberParam,
	} );
	const anchorFmPost = useParameter( {
		queryParamName: 'post',
		locationStateParamName: 'anchorFmPost',
		sanitize: sanitizeNumberParam,
	} );

	// anchorFmIsNewSite:
	// Indicates the backend has told us we need to make a new site and
	// we don't need to query it anymore.
	// If we start with "/new?anchor_podcast=abcdef0", the backend might say there's
	// no matching site and redirect us to "/new?anchor_podcast=abcdef0&anchor_episode=1234-123456&anchor_is_new_site=true",
	// because it found the last episode and wanted to pass that information to us.
	// In this case, we don't need to ask the backend again after restarting gutenboarding.
	const anchorFmIsNewSite = useParameter( {
		queryParamName: 'anchor_is_new_site',
		locationStateParamName: 'anchorFmIsNewSite',
		sanitize: ( flag: string ) => ( flag === 'true' ? 'true' : 'false' ),
	} );

	return {
		anchorFmPodcastId,
		isAnchorFmPodcastIdError,
		anchorFmEpisodeId,
		anchorFmSpotifyUrl,
		anchorFmSite,
		anchorFmPost,
		anchorFmIsNewSite,
	};
}
