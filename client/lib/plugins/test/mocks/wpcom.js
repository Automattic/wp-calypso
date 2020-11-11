var pluginsInstallCalls = 0;
var pluginsAutoupdateCalls = 0;
var pluginsActivateCalls = 0;
var pluginsDeactivateCalls = 0;
var pluginsDisableAutoupdateCalls = 0;
var pluginsRemoveCalls = 0;
var lastRequestParams = null;
var deactivatedCallbacks = false;
var wpcomPluginMock = {
	deactivate: function ( callback ) {
		pluginsDeactivateCalls++;
		callback();
	},

	delete: function ( site, plugin, callback ) {
		pluginsRemoveCalls++;
		callback();
	},
};
var pluginMock = {
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
var siteMock = {
	plugin: function () {
		return pluginMock;
	},

	wpcomPlugin: function () {
		return wpcomPluginMock;
	},
};
var mock = {
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
