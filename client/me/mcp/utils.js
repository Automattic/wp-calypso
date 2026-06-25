/**
 * Get account-level MCP abilities from user settings
 * This is for the /me/mcp route which manages account-level settings
 * @typedef {Object} McpAbility
 * @property {string} name
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} type
 * @property {boolean} enabled
 */
/**
 * Get account-level MCP abilities from user settings
 * @param {Object} userSettings - The user settings object
 * @returns {Record<string, McpAbility>} An object containing account-level MCP abilities
 */
export function getAccountMcpAbilities( userSettings ) {
	// Check new flat structure first
	if ( userSettings?.account ) {
		return userSettings.account;
	}

	// Current structure: mcp_abilities.account (nested)
	const mcpData = userSettings?.mcp_abilities;
	if ( mcpData?.account ) {
		return mcpData.account;
	}

	// Backward compatibility: if mcp_abilities is a flat object (very old structure),
	// treat it as account-level abilities
	if ( mcpData ) {
		return mcpData;
	}

	return {};
}

/**
 * Check if any account-level tools are enabled
 * @param {Object} userSettings - The user settings object
 * @returns {boolean} True if any account-level tools are enabled
 */
export function hasEnabledAccountTools( userSettings ) {
	const abilities = getAccountMcpAbilities( userSettings );
	return Object.values( abilities ).some( ( tool ) => tool.enabled );
}

/**
 * Get the account tools enabled state for a specific site
 * @param {Object} userSettings - The user settings object
 * @param {string|number} siteId - The site ID
 * @returns {boolean} True if account tools are enabled for this site (defaults to true)
 */
export function getSiteAccountToolsEnabled( userSettings, siteId ) {
	// Check new flat structure first
	if ( userSettings?.sites ) {
		const sites = userSettings.sites;
		const siteEntry = sites.find( ( site ) => site.blog_id === parseInt( siteId ) );
		if ( siteEntry ) {
			return siteEntry.account_tools_enabled;
		}
	}

	// Current structure: check nested mcp_abilities.sites
	const mcpSites = userSettings?.mcp_abilities?.sites || [];
	const siteEntry = mcpSites.find( ( site ) => site.blog_id === parseInt( siteId ) );
	if ( siteEntry ) {
		return siteEntry.account_tools_enabled;
	}

	// Default to true (enabled) if no entry exists
	return true;
}

/**
 * Get the set of tool IDs that are relevant in a site context.
 * Uses mcp_abilities.site as the authoritative list of site-applicable tools.
 * @param {Object} userSettings - The user settings object
 * @returns {Set<string>} Tool IDs relevant at the site level
 */
export function getSiteContextToolIds( userSettings ) {
	const siteTools = userSettings?.mcp_abilities?.site || {};
	return new Set( Object.keys( siteTools ) );
}

/**
 * Get site-level MCP ability overrides for a specific site
 * @param {Object} userSettings - The user settings object
 * @param {string|number} siteId - The site ID
 * @returns {Record<string, boolean>} Site-level ability overrides (toolId -> enabled)
 */
export function getSiteMcpAbilities( userSettings, siteId ) {
	const mcpSites = userSettings?.mcp_abilities?.sites || [];
	const siteEntry = mcpSites.find( ( site ) => site.blog_id === parseInt( siteId ) );
	return siteEntry?.abilities || {};
}

/**
 * Merge account-level MCP abilities with site-level overrides
 * @param {Record<string, Object>} accountAbilities - Account-level abilities from getAccountMcpAbilities
 * @param {Record<string, boolean>} siteAbilities - Site-level overrides from getSiteMcpAbilities
 * @returns {Record<string, Object>} Merged abilities with site overrides taking precedence
 */
export function mergeSiteMcpAbilities( accountAbilities, siteAbilities ) {
	return Object.fromEntries(
		Object.entries( accountAbilities ).map( ( [ toolId, tool ] ) => [
			toolId,
			{
				...tool,
				enabled: toolId in siteAbilities ? siteAbilities[ toolId ] : tool.enabled,
			},
		] )
	);
}

/**
 * Get site IDs where site-level MCP access is explicitly disabled.
 * These appear as exceptions when the account default is enabled.
 * @param {Object} userSettings - The user settings object
 * @returns {number[]} Site IDs with site_level_enabled set to false
 */
export function getDisabledSiteIds( userSettings ) {
	const mcpSites = userSettings?.mcp_abilities?.sites || [];
	return mcpSites
		.filter( ( site ) => site.site_level_enabled === false )
		.map( ( site ) => site.blog_id );
}

/**
 * Get the ordered display-group descriptors for the settings UI's middle
 * grouping layer (AIINT-469), sorted by their `order` field. A group defaults
 * to a STRAP facade, but some facades are merged into another group (e.g.
 * Create Site into Site).
 * @param {Object} userSettings - The user settings object
 * @returns {Array<{name: string, label: string, description: string, order: number}>}
 */
export function getGroupDescriptors( userSettings ) {
	const groups = userSettings?.mcp_abilities?.groups ?? [];
	return [ ...groups ].sort( ( a, b ) => a.order - b.order );
}

/**
 * Get the account-level group "enable all" intents (AIINT-471).
 * Keys are `read`, `write`, or a bare group slug (e.g. `site`) — matching a
 * getGroupDescriptors() entry's `name`.
 * @param {Object} userSettings - The user settings object
 * @returns {Record<string, boolean>}
 */
export function getGroupIntents( userSettings ) {
	return userSettings?.mcp_abilities?.group_intents ?? {};
}

/**
 * Check if the site-level MCP server is enabled for a specific site.
 * Uses site_level_enabled from the site's entry if present, otherwise
 * falls back to mcp_abilities.site_level_enabled_default.
 * @param {Object} userSettings - The user settings object
 * @param {string|number} siteId - The site ID
 * @returns {boolean}
 */
export function getSiteLevelEnabled( userSettings, siteId ) {
	const mcpAbilities = userSettings?.mcp_abilities;
	const mcpSites = mcpAbilities?.sites || [];
	const siteEntry = mcpSites.find( ( site ) => site.blog_id === parseInt( siteId ) );

	if ( siteEntry ) {
		return siteEntry.site_level_enabled === true;
	}

	return mcpAbilities?.site_level_enabled_default === true;
}

/**
 * Get site IDs where MCP access is explicitly enabled at the site level (allowlist).
 * @param {Object} userSettings - The user settings object
 * @returns {number[]} Site IDs with site_level_enabled set to true
 */
export function getEnabledSiteIds( userSettings ) {
	if ( userSettings?.sites ) {
		return userSettings.sites
			.filter( ( site ) => site.site_level_enabled === true )
			.map( ( site ) => site.blog_id );
	}

	const mcpSites = userSettings?.mcp_abilities?.sites || [];
	return mcpSites
		.filter( ( site ) => site.site_level_enabled === true )
		.map( ( site ) => site.blog_id );
}
