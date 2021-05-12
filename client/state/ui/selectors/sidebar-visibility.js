/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';
import { getPreference } from 'calypso/state/preferences/selectors';

export default function getSidebarIsCollapsed( state ) {
	return getPreference( state, 'sidebarCollapsed' );
}
