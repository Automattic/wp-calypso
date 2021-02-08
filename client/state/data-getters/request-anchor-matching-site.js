/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';

const requestAnchorMatchingSite = (
	anchorFmPodcastId,
	anchorFmEpisodeId,
	anchorFmSpotifyUrl,
	anchorFmSite,
	anchorFmPost
) => {
	const queryParts = {
		podcast: anchorFmPodcastId,
		episode: anchorFmEpisodeId,
		spotify_url: anchorFmSpotifyUrl,
		site: anchorFmSite,
		post: anchorFmPost,
	};
	const id =
		'request-matching-anchor-site-' +
		Object.values( queryParts )
			.map( ( x ) => x ?? '' )
			.join( '-' );

	Object.keys( queryParts ).forEach( ( k ) => {
		if ( queryParts[ k ] === null ) {
			delete queryParts[ k ];
		}
	} );

	return requestHttpData(
		id,
		http(
			{
				method: 'GET',
				path: '/anchor',
				apiNamespace: 'wpcom/v2',
			},
			queryParts
		),
		{
			freshness: -Infinity, // disable Caching
		}
	);
};
export default requestAnchorMatchingSite;
