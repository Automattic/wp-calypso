/**
 * Internal dependencies
 */
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

export function recordEditorEvent( action, label, value ) {
	return recordGoogleEvent( 'Editor', action, label, value );
}
