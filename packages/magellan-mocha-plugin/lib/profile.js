'use strict';

module.exports = {
	getProfiles: function ( browsers ) {
		if ( browsers.length > 0 ) {
			return [ { id: 'mocha' } ];
		} else {
			return [];
		}
	},
	/* eslint-disable no-unused-vars */
	getCapabilities: function ( profile ) {
		return { id: 'mocha' };
	},

	listBrowsers: function () {
		return [ 'mocha' ];
	},
};
