/**
 * Needed for store test
 */
var fetchPluginsListCalled = 0;

module.exports = {
	reset: function() {
		fetchPluginsListCalled = 0;
	},
	fetchPluginData: function() {},
	fetchPluginsList: function() {
		fetchPluginsListCalled++;
	},
	getActivity: function() {
		return { fetchPluginsListCalled: fetchPluginsListCalled };
	}
};

