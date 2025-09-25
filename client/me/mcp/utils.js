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
	const mcpData = userSettings?.mcp_abilities;

	if ( ! mcpData ) {
		return {};
	}

	// For account-level settings, we want to get the account-level abilities
	// If account-level abilities don't exist, fall back to the old flat structure for backward compatibility
	if ( mcpData.account ) {
		return mcpData.account;
	}

	// Backward compatibility: if mcp_abilities is a flat object (old structure),
	// treat it as account-level abilities
	if ( typeof mcpData === 'object' && ! mcpData.site && ! mcpData.sites ) {
		return mcpData;
	}

	return {};
}

/**
 * Create API payload for account-level MCP abilities updates
 * This creates the new nested structure for account-level settings
 * @param {Object} userSettings - The user settings object
 * @param {Record<string, McpAbility>} abilities - The abilities object from form data
 * @returns {Object} The API payload with mcp_abilities.account structure
 */
export function createAccountApiPayload( userSettings, abilities ) {
	// Convert abilities to the format expected by the API (boolean values)
	const accountAbilities = {};
	Object.entries( abilities ).forEach( ( [ toolId, tool ] ) => {
		// Handle both old structure (tool.enabled) and new structure (tool is just boolean)
		const enabled = typeof tool === 'object' ? tool.enabled : tool === true;
		accountAbilities[ toolId ] = enabled;
	} );

	// For account-level settings, we only send the account section
	// This matches the pattern from the site settings PR
	return {
		mcp_abilities: {
			account: accountAbilities,
		},
	};
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
