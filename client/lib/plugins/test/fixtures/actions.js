/**
 * Internal dependencies
 */
import plugins from './plugins';
import updatePluginsList from './plugins-updated';
import site from './site';
import multiSite from './multi-site';
import updatePluginData from './updated-plugin';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
} from 'calypso/lib/plugins/constants';

export default {
	// Fetch Data
	fetched: {
		type: 'RECEIVE_PLUGINS',
		site: site,
		data: { plugins: plugins },
		error: null,
	},

	fetchedMultiSite: {
		type: 'RECEIVE_PLUGINS',
		site: multiSite,
		data: { plugins: plugins },
		error: null,
	},

	fetchedAgain: {
		type: 'RECEIVE_PLUGINS',
		site: site,
		data: { plugins: updatePluginsList },
		error: null,
	},

	fetchedError: {
		type: 'RECEIVE_PLUGINS',
		site: { ID: 123 },
		data: undefined,
		error: {
			error: 'unauthorized_full_access',
			message: 'Full management mode is off for this site.',
			name: 'UnauthorizedFullAccessError',
		},
	},

	// Update
	updatePlugin: {
		type: 'UPDATE_PLUGIN',
		action: UPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 2 ], // hello dolly
	},

	updatedPlugin: {
		type: 'RECEIVE_UPDATED_PLUGIN',
		action: UPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 2 ],
		data: updatePluginData,
		error: null,
	},

	clearPluginUpdate: {
		type: 'REMOVE_PLUGINS_UPDATE_INFO',
		action: 'REMOVE_PLUGINS_UPDATE_INFO',
		site: site,
		plugin: plugins[ 2 ],
	},

	updatedPluginError: {
		type: 'RECEIVE_UPDATED_PLUGIN',
		action: UPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 2 ],
		data: {},
		error: {
			error: 'unauthorized_full_access',
			message: 'Full management mode is off for this site.',
			name: 'UnauthorizedFullAccessError',
		},
	},

	// Remove Plugin
	removePlugin: {
		type: 'REMOVE_PLUGIN',
		action: REMOVE_PLUGIN,
		site: site,
		plugin: plugins[ 2 ],
	},

	removedPluginError: {
		type: 'RECEIVE_REMOVE_PLUGIN',
		action: REMOVE_PLUGIN,
		site: site,
		plugin: plugins[ 2 ],
		data: null,
		error: { error: 'not allowed' },
	},

	// Remove Plugin
	removedPlugin: {
		type: 'RECEIVE_REMOVE_PLUGIN',
		action: REMOVE_PLUGIN,
		site: site,
		plugin: plugins[ 2 ],
	},

	// Activate
	activatePlugin: {
		type: ACTIVATE_PLUGIN,
		action: ACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
	},

	activatedPlugin: {
		type: 'RECEIVE_ACTIVATED_PLUGIN',
		action: ACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: {
			active: true,
			author: 'Automattic',
			author_url: 'http://automattic.com',
			autoupdate: false,
			description: 'The first stop for every WordPress developer',
			id: 'developer/developer',
			name: 'Developer',
			network: false,
			plugin_url: 'http://wordpress.org/extend/plugins/developer/',
			slug: 'developer',
			version: '1.2.5',
		},
		error: null,
	},

	activatedPluginError: {
		type: 'RECEIVE_ACTIVATED_PLUGIN',
		action: ACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: null,
		error: {
			error: 'unauthorized_full_access',
			message: 'Full management mode is off for this site.',
			name: 'UnauthorizedFullAccessError',
		},
	},

	activatedBrokenPluginError: {
		type: 'RECEIVE_ACTIVATED_PLUGIN',
		action: ACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: [],
		error: null,
	},

	activatedPluginErrorAlreadyActive: {
		type: 'RECEIVE_ACTIVATED_PLUGIN',
		action: ACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: null,
		error: {
			error: 'activation_error',
			message: 'The Plugin is already active.',
		},
	},
	// Deactivate
	deactivatePlugin: {
		type: 'DEACTIVATE_PLUGIN',
		action: DEACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
	},

	deactivatedPlugin: {
		type: 'RECEIVE_DEACTIVATED_PLUGIN',
		action: DEACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: {
			active: false,
			author: 'Automattic',
			author_url: 'http://automattic.com',
			autoupdate: false,
			description: 'The first stop for every WordPress developer',
			id: 'developer/developer',
			name: 'Developer',
			network: false,
			plugin_url: 'http://wordpress.org/extend/plugins/developer/',
			slug: 'developer',
			version: '1.2.5',
		},
		error: null,
	},

	deactivatedPluginError: {
		type: 'RECEIVE_DEACTIVATED_PLUGIN',
		action: DEACTIVATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: null,
		error: {
			error: 'unauthorized_full_access',
			message: 'Full management mode is off for this site.',
			name: 'UnauthorizedFullAccessError',
		},
	},

	deactivatedPluginErrorAlreadyNotActive: {
		type: 'RECEIVE_DEACTIVATED_PLUGIN',
		site: site,
		plugin: plugins[ 1 ], // developer
		data: null,
		error: {
			error: 'deactivation_error',
			message: 'The Plugin is already not active.',
		},
	},
	// Enable Autoupdate
	enableAutoupdatePlugin: {
		type: 'ENABLE_AUTOUPDATE_PLUGIN',
		action: ENABLE_AUTOUPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
	},

	enabledAutoupdatePlugin: {
		type: 'RECEIVE_ENABLED_AUTOUPDATE_PLUGIN',
		action: ENABLE_AUTOUPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: {
			active: false,
			author: 'Automattic',
			author_url: 'http://automattic.com',
			autoupdate: false,
			description: 'The first stop for every WordPress developer',
			id: 'developer/developer',
			name: 'Developer',
			network: false,
			plugin_url: 'http://wordpress.org/extend/plugins/developer/',
			slug: 'developer',
			version: '1.2.5',
		},
		error: null,
	},

	enabledAutoupdatePluginError: {
		type: 'RECEIVE_ENABLED_AUTOUPDATE_PLUGIN',
		action: ENABLE_AUTOUPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: null,
		error: {
			error: 'unauthorized_full_access',
			message: 'Full management mode is off for this site.',
			name: 'UnauthorizedFullAccessError',
		},
	},
	// Disable Autoupdate
	disableAutoupdatePlugin: {
		type: 'DISABLE_AUTOUPDATE_PLUGIN',
		action: DISABLE_AUTOUPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
	},

	disabledAutoupdatePlugin: {
		type: 'RECEIVE_DISABLED_AUTOUPDATE_PLUGIN',
		action: DISABLE_AUTOUPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: {
			active: false,
			author: 'Automattic',
			author_url: 'http://automattic.com',
			autoupdate: false,
			description: 'The first stop for every WordPress developer',
			id: 'developer/developer',
			name: 'Developer',
			network: false,
			plugin_url: 'http://wordpress.org/extend/plugins/developer/',
			slug: 'developer',
			version: '1.2.5',
		},
		error: null,
	},

	disabledAutoupdatePluginError: {
		type: 'RECEIVE_DISABLED_AUTOUPDATE_PLUGIN',
		action: DISABLE_AUTOUPDATE_PLUGIN,
		site: site,
		plugin: plugins[ 1 ], // developer
		data: null,
		error: {
			error: 'unauthorized_full_access',
			message: 'Full management mode is off for this site.',
			name: 'UnauthorizedFullAccessError',
		},
	},
};
