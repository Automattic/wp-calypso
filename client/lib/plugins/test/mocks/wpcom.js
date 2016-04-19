var pluginsInstallCalls = 0,
	pluginsAutoupdateCalls = 0,
	pluginsActivateCalls = 0,
	pluginsDeactivateCalls = 0,
	pluginsDisableAutoupdateCalls = 0,
	pluginsRemoveCalls = 0,
	lastRequestParams = null,
	deactivatedCallbacks = false,
	mock = {
		reset: function() {
			pluginsAutoupdateCalls = 0;
			pluginsActivateCalls = 0;
			pluginsInstallCalls = 0;
			pluginsDeactivateCalls = 0;
			pluginsDisableAutoupdateCalls = 0;
			pluginsRemoveCalls = 0;
			deactivatedCallbacks = false;
			lastRequestParams = null;
		},

		getActivity: function() {
			return {
				pluginsAutoupdateCalls: pluginsAutoupdateCalls,
				pluginsInstallCalls: pluginsInstallCalls,
				pluginsActivateCalls: pluginsActivateCalls,
				pluginsDeactivateCalls: pluginsDeactivateCalls,
				pluginsDisableAutoupdateCalls: pluginsDisableAutoupdateCalls,
				pluginsRemoveCalls: pluginsRemoveCalls,
				lastRequestParams: lastRequestParams
			};
		},

		pluginsInstall: function( site, plugin, callback ) {
			pluginsInstallCalls++;
			lastRequestParams = {
				site: site,
				plugin: plugin
			};
			if ( ! deactivatedCallbacks ) {
				callback( null, {
					code: 200,
					headers: [ { name: 'Content-Type', value: 'application/json' } ],
					body: {}
				} );
			}
		},

		pluginsActivate: function( site, plugin, callback ) {
			pluginsActivateCalls++;
			callback();
		},

		enableAutoupdates: function( site, plugin, callback ) {
			pluginsAutoupdateCalls++;
			callback();
		},

		pluginsDeactivate: function( site, plugin, callback ) {
			pluginsDeactivateCalls++;
			callback();
		},

		disableAutoupdates: function( site, plugin, callback ) {
			pluginsDisableAutoupdateCalls++;
			callback();
		},

		deactivateWpcomPlugin: function() {
			pluginsDeactivateCalls++;
		},

		pluginsDelete: function( site, plugin, callback ) {
			pluginsRemoveCalls++;
			callback();
		},

		undocumented: function() {
			return mock;
		}

	};

module.exports = mock;
