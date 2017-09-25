/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

const PeopleActions = {

	removePeopleNotices: ( logs ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PEOPLE_NOTICES',
			logs: logs
		} );
	}

};

module.exports = PeopleActions;
