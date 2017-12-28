/** @format */

/**
 * Internal dependencies
 */

import Dispatcher from 'client/dispatcher';

var PeopleActions = {
	removePeopleNotices: logs => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PEOPLE_NOTICES',
			logs: logs,
		} );
	},
};

export default PeopleActions;
