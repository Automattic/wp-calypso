import debugModule from 'debug';
import { requestDSP } from 'calypso/lib/dsp';
import {
	PROMOTE_POST_CAMPAIGNS_FETCH,
	PROMOTE_POST_CAMPAIGNS_FETCH_DONE,
} from 'calypso/state/action-types';
import { Campaign } from 'calypso/state/promote-post/selectors';

/**
 *  Local variables;
 */
const debug = debugModule( 'calypso:state:promote-post:actions' );

export function fetchCampaigns( siteId: number ) {
	return async (
		dispatch: ( arg0: { type: string; siteId: number; campaigns?: Campaign[] } ) => void
	) => {
		debug( 'Getting campaigns' );
		dispatch( {
			type: PROMOTE_POST_CAMPAIGNS_FETCH,
			siteId,
		} );

		try {
			const { results: campaigns } = await requestDSP< { results: Campaign[] } >(
				siteId,
				'/campaigns/full'
			);
			dispatch( {
				type: PROMOTE_POST_CAMPAIGNS_FETCH_DONE,
				siteId,
				campaigns,
			} );
		} catch ( error ) {
			debug( 'Error getting campaigns', error );
			dispatch( {
				type: PROMOTE_POST_CAMPAIGNS_FETCH_DONE,
				siteId,
				campaigns: [],
			} );
		}
	};
}
