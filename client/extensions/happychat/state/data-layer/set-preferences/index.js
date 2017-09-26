/**
 * Internal dependencies
 */
import {
	getCurrentUserLocale,
} from 'state/current-user/selectors';
import {
	isHappychatClientConnected,
	getGroups,
} from 'extensions/happychat/state/selectors';

const setPreferences = ( connection ) => ( { getState }, { siteId } ) => {
	const state = getState();

	if ( isHappychatClientConnected( state ) ) {
		const locale = getCurrentUserLocale( state );
		const groups = getGroups( state, siteId );

		connection.setPreferences( locale, groups );
	}
};

export default setPreferences;
