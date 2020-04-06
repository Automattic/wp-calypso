/**
 * Internal dependencies
 */
import { bumpStat } from 'state/analytics/actions';

export function recordEditorStat( action ) {
	return bumpStat( 'editor_actions', action );
}
