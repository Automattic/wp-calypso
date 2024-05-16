import debugFactory from 'debug';
import * as tracks from 'calypso/lib/analytics/tracks';
import * as tracksUtils from './tracks-utils';

const debug = debugFactory( 'woocommerce:analytics' );

export const recordTrack = tracksUtils.recordTrack( tracks, debug );
export const bumpStat = tracksUtils.bumpMCStat( debug );
