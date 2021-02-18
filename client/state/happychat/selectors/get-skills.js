/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SKILL_PRODUCT,
	HAPPYCHAT_SKILL_LANGUAGE,
} from 'calypso/state/happychat/constants';
import getGroups from 'calypso/state/happychat/selectors/get-groups';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

/**
 * Returns an object of happychat skills array ( product - before known as groups and language )
 *
 * @param {object} state Global state tree
 * @param {string} siteId Id of the selected site used to determine the product (wpcom, jetpack)
 *
 * @returns {string} Current user geo location
 */
export default ( state, siteId ) => {
	const skills = {
		// TODO: we should rename this to getProduct when cleaning up groups and locales
		[ HAPPYCHAT_SKILL_PRODUCT ]: getGroups( state, siteId ),
	};

	const language = getCurrentUserLocale( state );
	if ( language ) {
		skills[ HAPPYCHAT_SKILL_LANGUAGE ] = [ language ];
	}

	return skills;
};
