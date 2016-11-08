let fetchPluginInformationCalls = 0,
	fetchPluginListsCalls = 0,
	lastRequestParams = null;

module.exports = {
	deactivatedCallbacks: false,
	reset: function() {
		fetchPluginInformationCalls = 0;
		fetchPluginListsCalls = 0;
		this.deactivatedCallbacks = false;
		lastRequestParams = null;
	},
	getActivity: function() {
		return {
			fetchPluginsList: fetchPluginListsCalls,
			fetchPluginInformation: fetchPluginInformationCalls,
			lastRequestParams: lastRequestParams
		};
	},
	fetchPluginInformation: function( pluginSlug, callback ) {
		fetchPluginInformationCalls++;
		if ( ! this.deactivatedCallbacks ) {
			setTimeout( function() {
				callback( null, {
					slug: pluginSlug
				} );
			}, 1 );
		}
	},
	fetchPluginsList: function( options, callback ) {
		fetchPluginListsCalls++;
		setTimeout( function() {
			callback( null, { info: {} } );
		}, 1 );
	}
};
