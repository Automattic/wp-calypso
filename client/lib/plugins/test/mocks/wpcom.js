var pluginsInstallCalls = 0,
	pluginsAutoupdateCalls = 0,
	pluginsActivateCalls = 0,
	pluginsDeactivateCalls = 0,
	pluginsDisableAutoupdateCalls = 0,
	pluginsRemoveCalls = 0,
	lastRequestParams = null,
	deactivatedCallbacks = false,
	wpcomPluginMock = {
		deactivate: function ( callback ) {
			pluginsDeactivateCalls++;
			callback();
		},

		delete: function ( site, plugin, callback ) {
			pluginsRemoveCalls++;
			callback();
		},
	},
	pluginMock = {
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
	},
	siteMock = {
		plugin: function () {
			return pluginMock;
		},

		wpcomPlugin: function () {
			return wpcomPluginMock;
		},
	},
	mock = {
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
