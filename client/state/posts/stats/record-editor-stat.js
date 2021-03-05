/**
 * Internal dependencies
 */
import { bumpStat } from 'calypso/state/analytics/actions';

export function recordEditorStat( action ) {
	return bumpStat( 'editor_actions', action );
}
