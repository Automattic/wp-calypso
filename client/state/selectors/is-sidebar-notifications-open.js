import { get } from 'lodash';

import 'calypso/state/ui/init';

/**
 * Returns true if the notifications panel from sidebar is open.
 * @param  {Object}  state - Global state tree
 * @returns {boolean} true  - if notifications is open.
 */
export default function isSidebarNotificationsOpen( state ) {
	return get( state, 'ui.isSidebarNotificationsOpen', false );
}
