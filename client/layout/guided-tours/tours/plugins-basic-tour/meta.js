/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isEnabled } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';
import { getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'state/selectors/can-current-user-manage-plugins';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

const isAtomic = state => isSiteAutomatedTransfer( state, getSelectedSiteId( state ) );

const userCanManagePlugins = state => {
	const siteId = getSelectedSiteId( state );
	if ( siteId ) {
		return canCurrentUser( state, siteId, 'manage_options' );
	}

	return canCurrentUserManagePlugins( state );
};

export default {
	name: 'pluginsBasicTour',
	version: '20180718',
	path: [ '/stats', '/plugins' ],
	when: and( userCanManagePlugins, isAtomic, isDesktop, isEnabled( 'calypsoify/plugins' ) ),
};
