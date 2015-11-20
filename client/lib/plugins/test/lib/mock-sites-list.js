/**
 * Needed for store test
 */

module.exports = function() {
	return {
		getSite: function() {
			return {
				fetchAvailableUpdates: function() {}
			};
		},
		onUpdatedPlugin: function() {
			return;
		},
		getNetworkSites: function() {
			return [];
		}
	};
};
