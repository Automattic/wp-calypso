/**
 * Plugin Compass agent identification helper.
 *
 * Plugin Compass mounts AgentsManager directly on Calypso's plugins
 * marketplace pages with a host-customized empty view (greeting, help copy,
 * suggestion chips that route into the plugin-discovery workflow).
 */

const PLUGIN_COMPASS_AGENT_ID = 'wpcom-workflow-plugin_compass';

/**
 * True if the current host is running under the Plugin Compass agent.
 * Reads from `window.agentsManagerData.agentId` (set by the Plugin Compass
 * loader before AgentsManager mounts).
 */
export function isPluginCompassHost(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const agentId = ( window as unknown as { agentsManagerData?: { agentId?: string } } )
		.agentsManagerData?.agentId;
	return agentId === PLUGIN_COMPASS_AGENT_ID;
}
