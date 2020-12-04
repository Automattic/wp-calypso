/**
 * Internal dependencies
 */

import Dispatcher from 'calypso/dispatcher';

const PeopleActions = {
	removePeopleNotices: ( logs ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PEOPLE_NOTICES',
			logs: logs,
		} );
	},
};

export default PeopleActions;
