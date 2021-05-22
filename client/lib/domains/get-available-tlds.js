/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export function getAvailableTlds( query = {} ) {
	return wpcom.undocumented().getAvailableTlds( query );
}
