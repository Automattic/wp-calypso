/**
 * Get account-level MCP abilities from user settings
 * This is for the /me/mcp route which manages account-level settings
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
 */
export function createAccountApiPayload( userSettings, abilities ) {
	// Convert abilities to the format expected by the API (1/0 instead of boolean)
	const accountAbilities = {};
	Object.entries( abilities ).forEach( ( [ toolId, tool ] ) => {
		// Handle both old structure (tool.enabled) and new structure (tool is just 1/0)
		const enabled = typeof tool === 'object' ? tool.enabled : tool === 1;
		accountAbilities[ toolId ] = enabled ? 1 : 0;
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
 */
export function hasEnabledAccountTools( userSettings ) {
	const abilities = getAccountMcpAbilities( userSettings );
	return Object.values( abilities ).some( ( tool ) => tool.enabled );
}
