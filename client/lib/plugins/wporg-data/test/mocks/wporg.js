let fetchPluginsListCalls = 0,
	lastRequestParams = null;

export default {
	deactivatedCallbacks: false,
	mockedNumberOfReturnedPages: 10,
	reset: function() {
		fetchPluginsListCalls = 0;
		this.mockedNumberOfReturnedPages = 10;
		this.deactivatedCallbacks = false;
		lastRequestParams = null;
	},
	getActivity: function() {
		return {
			fetchPluginsList: fetchPluginsListCalls,
			lastRequestParams: lastRequestParams
		};
	},
	fetchPluginsList: function( options, callback ) {
		fetchPluginsListCalls++;
		lastRequestParams = options;
		if ( ! this.deactivatedCallbacks ) {
			callback( null, {
				plugins: [],
				info: { pages: this.mockedNumberOfReturnedPages }
			} );
		}
	}
};
