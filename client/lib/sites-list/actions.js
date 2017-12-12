/** @format */

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

const SitesListActions = {
	removeSitesNotices( logs ) {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_SITES_NOTICES',
			logs,
		} );
	},
};

export default SitesListActions;
