/**
 * Internal dependencies
 */
import { HAPPYCHAT_SKILL_PRODUCT, HAPPYCHAT_SKILL_LANGUAGE } from 'state/happychat/constants';
import getGroups from 'state/happychat/selectors/get-groups';
import { getCurrentUserLocale } from 'state/current-user/selectors';

/**
 * Returns an object of happychat skills array ( product - before known as groups and language )
 *
 * @param { Object } state Global state tree
 * @param { String } siteId Id of the selected site used to determine the product (wpcom, jetpack)
 *
 * @returns { String } Current user geo location
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
