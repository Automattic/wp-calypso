module.exports = {
	getProfiles: function ( browsers ) {
		if ( browsers.length > 0 ) {
			return [ { id: 'mocha' } ];
		}
		return [];
	},
	getCapabilities: function () {
		return { id: 'mocha' };
	},

	listBrowsers: function () {
		return [ 'mocha' ];
	},
};
