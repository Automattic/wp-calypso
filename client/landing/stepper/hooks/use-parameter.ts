import { useLocation } from 'react-router-dom';

export interface StateType {
	anchorFmPodcastId?: string;
	anchorFmEpisodeId?: string;
	anchorFmSpotifyUrl?: string;
	anchorFmSite?: string;
	anchorFmPost?: string;
	anchorFmIsNewSite?: string;
}
export type StateKeyType = keyof StateType;

/*
 useParameter is an internal helper for finding a value that comes from either a query string, or location state.
 For example, when a user hits http://calypso.localhost:3000/new?anchor_podcast=40a166a8
 We grab that anchor_podcast value, and store it in location state to keep as we move along the states.
 It's called "anchor_podcast" in the query string above, but "anchorFmPodcastId" above.
  Calling this function like so:
  useParameter({
    queryParamName: 'anchor_podcast',
    locationStateParamName: 'anchorFmPodcastId',
  })
  Looks for the value first in location state, then if it can't be found, looks in the query parameter.
*/
interface UseParameterType {
	queryParamName: string;
	locationStateParamName: StateKeyType;
	sanitize: ( arg0: string ) => string;
}

export default function useParameter( {
	queryParamName,
	locationStateParamName,
	sanitize,
}: UseParameterType ): string | null {
	const { state: locationState = {}, search } = useLocation< StateType >();

	// Use location state if available
	const locationStateParamValue = locationState[ locationStateParamName ];
	if ( locationState && locationStateParamValue ) {
		return sanitize( locationStateParamValue );
	}

	// Fall back to looking in query param
	const queryParamValue = new URLSearchParams( search ).get( queryParamName );
	if ( queryParamValue ) {
		return sanitize( queryParamValue );
	}
	return null;
}
