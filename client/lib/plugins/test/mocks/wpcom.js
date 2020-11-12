let pluginsInstallCalls = 0;
let pluginsAutoupdateCalls = 0;
let pluginsActivateCalls = 0;
let pluginsDeactivateCalls = 0;
let pluginsDisableAutoupdateCalls = 0;
let pluginsRemoveCalls = 0;
let lastRequestParams = null;
let deactivatedCallbacks = false;
const wpcomPluginMock = {
	deactivate: function ( callback ) {
		pluginsDeactivateCalls++;
		callback();
	},

	delete: function ( site, plugin, callback ) {
		pluginsRemoveCalls++;
		callback();
	},
};
const pluginMock = {
	activate: function ( callback ) {
		pluginsActivateCalls++;
		callback();
	},

	deactivate: function ( callback ) {
		pluginsDeactivateCalls++;
		callback();
	},

	enableAutoupdate: function ( callback ) {
		pluginsAutoupdateCalls++;
		callback();
	},

	disableAutoupdate: function ( callback ) {
		pluginsDisableAutoupdateCalls++;
		callback();
	},

	delete: function ( site, plugin, callback ) {
		pluginsRemoveCalls++;
		callback();
	},

	install: function ( callback ) {
		pluginsInstallCalls++;

		if ( ! deactivatedCallbacks ) {
			callback( null, {
				code: 200,
				headers: [ { name: 'Content-Type', value: 'application/json' } ],
				body: {},
			} );
		}
	},
};
const siteMock = {
	plugin: function () {
		return pluginMock;
	},

	wpcomPlugin: function () {
		return wpcomPluginMock;
	},
};
const mock = {
	site: function () {
		return siteMock;
	},

	reset: function () {
		pluginsAutoupdateCalls = 0;
		pluginsActivateCalls = 0;
		pluginsInstallCalls = 0;
		pluginsDeactivateCalls = 0;
		pluginsDisableAutoupdateCalls = 0;
		pluginsRemoveCalls = 0;
		deactivatedCallbacks = false;
		lastRequestParams = null;
	},

	getActivity: function () {
		return {
			pluginsAutoupdateCalls: pluginsAutoupdateCalls,
			pluginsInstallCalls: pluginsInstallCalls,
			pluginsActivateCalls: pluginsActivateCalls,
			pluginsDeactivateCalls: pluginsDeactivateCalls,
			pluginsDisableAutoupdateCalls: pluginsDisableAutoupdateCalls,
			pluginsRemoveCalls: pluginsRemoveCalls,
			lastRequestParams: lastRequestParams,
		};
	},

	undocumented: function () {
		return mock;
	},
};

export default mock;
