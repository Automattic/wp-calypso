import { bumpStat } from 'calypso/lib/analytics/mc';
import debug from './debug';

export function recordAction( action: string ) {
	debug( 'reader action', action );
	bumpStat( 'reader_actions', action );
}
