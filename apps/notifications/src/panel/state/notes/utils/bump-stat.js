/**
 * Internal dependencies
 */
import { bumpStat as rawBumpStat } from '../../../rest-client/bump-stat';

export default function bumpStat( name ) {
	rawBumpStat( 'notes-click-action', name );
}
