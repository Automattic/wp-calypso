/** @format */
/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' );

var PeopleActions = {
	removePeopleNotices: logs => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PEOPLE_NOTICES',
			logs: logs,
		} );
	},
};

module.exports = PeopleActions;
