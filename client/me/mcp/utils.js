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
 * Get site IDs where MCP access is disabled at the site level
 * @param {Object} userSettings - The user settings object
 * @returns {number[]} Site IDs with account tools disabled
 */
export function getDisabledSiteIds( userSettings ) {
	if ( userSettings?.sites ) {
		return userSettings.sites
			.filter( ( site ) => site.account_tools_enabled === false )
			.map( ( site ) => site.blog_id );
	}

	const mcpSites = userSettings?.mcp_abilities?.sites || [];
	return mcpSites
		.filter( ( site ) => site.account_tools_enabled === false )
		.map( ( site ) => site.blog_id );
}

/**
 * Enable all account-level MCP tools and add site exceptions so MCP is only available on
 * `selectedSiteId` for the visible sites list (every other visible site is blocked).
 * @param {Object} userSettings
 * @param {Array<{ ID: number }>} visibleSites Sites from the user’s visible sites list.
 * @param {number} selectedSiteId Site that should keep MCP access.
 * @returns {{ mcp_abilities: { account: Record<string, boolean>, sites: Array<{ blog_id: number, account_tools_enabled: boolean }> } } | null} Null if there are no account tools to enable.
 */
export function buildMcpAllowSingleSitePayload( userSettings, visibleSites, selectedSiteId ) {
	const abilities = getAccountMcpAbilities( userSettings || {} );
	const toolIds = Object.keys( abilities );
	if ( toolIds.length === 0 ) {
		return null;
	}

	const account = {};
	toolIds.forEach( ( toolId ) => {
		account[ toolId ] = true;
	} );

	const sites = visibleSites
		.filter( ( site ) => site.ID !== selectedSiteId )
		.map( ( site ) => ( {
			blog_id: site.ID,
			account_tools_enabled: false,
		} ) );

	// Clear a previous site exception for the selected site, if any.
	const disabledIds = getDisabledSiteIds( userSettings || {} );
	if ( disabledIds.includes( selectedSiteId ) ) {
		sites.push( {
			blog_id: selectedSiteId,
			account_tools_enabled: true,
		} );
	}

	return {
		mcp_abilities: {
			account,
			sites,
		},
	};
}
