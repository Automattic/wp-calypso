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

export function getGroupDescriptors( userSettings ) {
	const groups = userSettings?.mcp_abilities?.groups ?? [];
	return [ ...groups ].sort( ( a, b ) => a.order - b.order );
}

export function getGroupIntents( userSettings ) {
	return userSettings?.mcp_abilities?.group_intents ?? {};
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
 * Get the remote-ability allowlist (AI-1329) for a specific site
 * @param {Object} userSettings - The user settings object
 * @param {string|number} siteId - The site ID
 * @returns {Record<string, boolean>} Remote-group map ("{read|write|destructive}:{namespace}" -> true)
 */
export function getSiteRemoteGroups( userSettings, siteId ) {
	const mcpSites = userSettings?.mcp_abilities?.sites || [];
	const siteEntry = mcpSites.find( ( site ) => site.blog_id === parseInt( siteId ) );
	return siteEntry?.remote_groups || {};
}

/**
 * The allowlist group key of a remote ability: "{read|write|destructive}:{namespace}".
 * Mirrors SettingsHelper::remote_group_key() — destructive wins over readonly, only a
 * strict readonly counts as Read, and the namespace is lowercased — so the UI groups
 * abilities exactly the way the server enforces them.
 * @param {string} name - Ability name, e.g. "jetpack-boost/get-modules"
 * @param {Object} [annotations] - Published annotations (readonly, destructive)
 * @returns {string} Group key
 */
export function getRemoteAbilityGroupKey( name, annotations = {} ) {
	const namespace = String( name ).split( '/' )[ 0 ].toLowerCase();
	if ( annotations?.destructive === true ) {
		return `destructive:${ namespace }`;
	}
	if ( annotations?.readonly === true ) {
		return `read:${ namespace }`;
	}
	return `write:${ namespace }`;
}

/**
 * The access-level page an ability belongs on: everything that isn't a strict
 * read is treated as a write (destructive included) for display purposes.
 * @param {string} name - Ability name
 * @param {Object} [annotations] - Published annotations
 * @returns {'read'|'write'} Access-level category
 */
export function getRemoteAbilityCategory( name, annotations = {} ) {
	return getRemoteAbilityGroupKey( name, annotations ).startsWith( 'read:' ) ? 'read' : 'write';
}

/**
 * The ability-level allowlist key of a remote ability: "{group}/{ability}"
 * (e.g. "write:akismet/check-comment"). Wins over the group key in server-side
 * resolution, so one ability can be allowed or denied inside its group.
 * @param {string} name - Ability name
 * @param {Object} [annotations] - Published annotations
 * @returns {string} Ability-level key
 */
export function getRemoteAbilityKey( name, annotations = {} ) {
	const namespace = String( name ).split( '/' )[ 0 ];
	return `${ getRemoteAbilityGroupKey( name, annotations ) }${ String( name ).slice(
		namespace.length
	) }`.toLowerCase();
}

/**
 * Whether a remote ability is enabled in a saved allowlist: the ability-level
 * key when present, otherwise the group key, otherwise the default.
 * @param {Object} savedGroups - Saved remote-group map
 * @param {string} name - Ability name
 * @param {Object} [annotations] - Published annotations
 * @param {boolean} [defaultEnabled] - State when nothing is saved for the ability or its group
 * @returns {boolean}
 */
export function isRemoteAbilityEnabled(
	savedGroups,
	name,
	annotations = {},
	defaultEnabled = false
) {
	return (
		savedGroups[ getRemoteAbilityKey( name, annotations ) ] ??
		savedGroups[ getRemoteAbilityGroupKey( name, annotations ) ] ??
		defaultEnabled
	);
}

/**
 * Whether a saved allowlist key (group or ability level) is enabled, falling
 * back to the default when nothing is saved for it.
 * @param {Object} savedGroups - Saved remote-group map
 * @param {string} key - Allowlist key
 * @param {boolean} [defaultEnabled] - State when the key isn't saved
 * @returns {boolean}
 */
export function isRemoteKeyEnabled( savedGroups, key, defaultEnabled = false ) {
	return savedGroups[ key ] ?? defaultEnabled;
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
