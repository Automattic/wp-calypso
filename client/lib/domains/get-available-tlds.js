/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

export function getAvailableTlds( query = {} ) {
	return wpcom.undocumented().getAvailableTlds( query );
}
