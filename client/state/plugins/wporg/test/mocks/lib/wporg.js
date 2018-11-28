/** @format */

let fetchPluginInformationCalls = 0;
let lastRequestParams = null;

export default {
	reset: function() {
		fetchPluginInformationCalls = 0;
		lastRequestParams = null;
	},
	getActivity: function() {
		return {
			fetchPluginInformationCalls,
			lastRequestParams,
		};
	},
	fetchPluginInformation: function( pluginSlug ) {
		fetchPluginInformationCalls++;
		return Promise.resolve( { slug: pluginSlug } );
	},
};
