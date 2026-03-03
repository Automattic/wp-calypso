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

// localStorage key for prototype: persists per-site MCP overrides that the
// API doesn't store (account_tools_enabled=true is the default and gets stripped).
const MCP_ENABLED_SITES_KEY = 'mcp_enabled_site_ids';

/**
 * Get site IDs where MCP access is explicitly enabled at the site level
 * (used when account-level MCP is off, to find per-site overrides)
 * Falls back to localStorage for prototype purposes.
 * @param {Object} userSettings - The user settings object
 * @returns {number[]} Site IDs with account tools explicitly enabled
 */
export function getEnabledSiteIds( userSettings ) {
	// Check API data first
	const sites = userSettings?.sites || userSettings?.mcp_abilities?.sites || [];
	const apiEnabled = sites
		.filter( ( site ) => site.account_tools_enabled === true )
		.map( ( site ) => site.blog_id );

	// Merge with localStorage (prototype fallback)
	let localEnabled = [];
	try {
		const stored = localStorage.getItem( MCP_ENABLED_SITES_KEY );
		localEnabled = stored ? JSON.parse( stored ) : [];
	} catch {}

	return [ ...new Set( [ ...apiEnabled, ...localEnabled ] ) ];
}

/**
 * Add a site ID to the localStorage-backed enabled list (prototype).
 * @param {number} siteId
 */
export function addLocalEnabledSiteId( siteId ) {
	try {
		const stored = localStorage.getItem( MCP_ENABLED_SITES_KEY );
		const current = stored ? JSON.parse( stored ) : [];
		if ( ! current.includes( siteId ) ) {
			current.push( siteId );
			localStorage.setItem( MCP_ENABLED_SITES_KEY, JSON.stringify( current ) );
		}
	} catch {}
}

/**
 * Clear all localStorage-backed enabled site IDs (prototype).
 * Called when MCP is toggled on globally — individual overrides are no longer needed.
 */
export function clearLocalEnabledSiteIds() {
	try {
		localStorage.removeItem( MCP_ENABLED_SITES_KEY );
	} catch {}
}

/**
 * Remove a site ID from the localStorage-backed enabled list (prototype).
 * @param {number} siteId
 */
export function removeLocalEnabledSiteId( siteId ) {
	try {
		const stored = localStorage.getItem( MCP_ENABLED_SITES_KEY );
		const current = stored ? JSON.parse( stored ) : [];
		localStorage.setItem(
			MCP_ENABLED_SITES_KEY,
			JSON.stringify( current.filter( ( id ) => id !== siteId ) )
		);
	} catch {}
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
