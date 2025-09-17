import { wpcom } from '@automattic/api-core';
import type { SiteMcpAbilities } from '@automattic/api-core';

export type McpAbilitiesStructure = {
	account?: SiteMcpAbilities;
	site?: SiteMcpAbilities; // Default values for all sites
	sites?: Record< string, SiteMcpAbilities >; // Custom overrides per site
};

// API payload structure (simplified format for API calls)
export type McpAbilitiesApiStructure = {
	account?: Record< string, number >;
	site?: Record< string | number, Record< string, number > >; // site_id => abilities mapping
	sites?: Record< string | number, Record< string, number > >; // Custom overrides per site
};

/**
 * Get MCP abilities for a specific site using the new optimized structure
 * Falls back to default site abilities, then account-level abilities
 */
export function getSiteMcpAbilities(
	userSettings: any,
	siteId: string | number
): SiteMcpAbilities {
	const siteIdStr = String( siteId );
	const mcpData = userSettings?.mcp_abilities;

	if ( ! mcpData ) {
		return {};
	}

	// Start with default site abilities
	const defaultSiteAbilities = mcpData.site || {};

	// Apply site-specific overrides if they exist
	const siteOverrides = mcpData.sites?.[ siteIdStr ] || {};

	// Merge defaults with overrides
	const mergedAbilities: SiteMcpAbilities = {};

	// First, add all default abilities
	Object.entries( defaultSiteAbilities ).forEach( ( [ abilityName, ability ] ) => {
		if ( ability && typeof ability === 'object' ) {
			// @ts-ignore - TypeScript spread operator issue with potentially undefined values
			mergedAbilities[ abilityName ] = { ...ability };
		}
	} );

	// Then, apply any site-specific overrides
	Object.entries( siteOverrides ).forEach( ( [ abilityName, ability ] ) => {
		if ( ability && typeof ability === 'object' ) {
			// @ts-ignore - TypeScript spread operator issue with potentially undefined values
			mergedAbilities[ abilityName ] = { ...ability };
		}
	} );

	return mergedAbilities;
}

/**
 * Get the effective state of a specific ability for a site
 * Implements the fallback logic: site override -> default site -> account
 */
export function getSiteAbilityState(
	abilityName: string,
	siteId: string | number,
	userSettings: any
): boolean {
	const siteIdStr = String( siteId );
	const mcpData = userSettings?.mcp_abilities;

	if ( ! mcpData ) {
		return false;
	}

	// Check if site has custom override
	if ( mcpData.sites?.[ siteIdStr ]?.[ abilityName ] ) {
		return mcpData.sites[ siteIdStr ][ abilityName ].enabled;
	}

	// Fall back to default from 'site' section
	if ( mcpData.site?.[ abilityName ] ) {
		return mcpData.site[ abilityName ].enabled;
	}

	// Final fallback to account-level (for backward compatibility)
	if ( mcpData.account?.[ abilityName ] ) {
		return mcpData.account[ abilityName ].enabled;
	}

	return false;
}

/**
 * Get account-level MCP abilities
 */
export function getAccountMcpAbilities(
	userSettings: { mcp_abilities?: McpAbilitiesStructure } | null
): SiteMcpAbilities {
	return userSettings?.mcp_abilities?.account || {};
}

/**
 * Update MCP abilities for a specific site
 * Only stores differences from the default site abilities
 */
export function updateSiteMcpAbilities(
	userSettings: any,
	siteId: string | number,
	abilities: SiteMcpAbilities
): McpAbilitiesStructure {
	const siteIdStr = String( siteId );
	const mcpData = userSettings?.mcp_abilities;
	const defaultSiteAbilities = mcpData?.site || {};

	// Find only the abilities that differ from defaults
	const siteOverrides: SiteMcpAbilities = {};
	Object.entries( abilities ).forEach( ( [ abilityName, ability ] ) => {
		const defaultAbility = defaultSiteAbilities[ abilityName ];

		// Only store if it differs from the default
		if ( ! defaultAbility || defaultAbility.enabled !== ability.enabled ) {
			siteOverrides[ abilityName ] = Object.assign( {}, ability );
		}
	} );

	// If no overrides needed, remove the site from sites object
	const newSites = { ...mcpData?.sites };
	if ( Object.keys( siteOverrides ).length === 0 ) {
		delete newSites[ siteIdStr ];
	} else {
		newSites[ siteIdStr ] = siteOverrides;
	}

	return {
		...mcpData,
		sites: newSites,
	};
}

/**
 * Convert SiteMcpAbilities to the simplified format expected by the API
 * (enabled status as 1/0 instead of boolean)
 */
export function convertAbilitiesForApi( abilities: SiteMcpAbilities ): Record< string, number > {
	const result: Record< string, number > = {};
	Object.entries( abilities ).forEach( ( [ toolId, tool ] ) => {
		result[ toolId ] = tool.enabled ? 1 : 0;
	} );
	return result;
}

/**
 * Convert API response back to SiteMcpAbilities format
 * (1/0 back to boolean enabled status)
 */
export function convertAbilitiesFromApi(
	apiAbilities: Record< string, number >,
	originalAbilities: SiteMcpAbilities
): SiteMcpAbilities {
	const result: SiteMcpAbilities = {};
	Object.entries( apiAbilities ).forEach( ( [ toolId, enabled ] ) => {
		if ( originalAbilities[ toolId ] ) {
			result[ toolId ] = {
				...originalAbilities[ toolId ],
				enabled: enabled === 1,
			};
		}
	} );
	return result;
}

/**
 * Create optimized API payload for site-specific updates
 * Uses the new 'site' key format for single site updates
 */
export function createSiteSpecificApiPayload(
	userSettings: any,
	siteId: string | number,
	abilities: SiteMcpAbilities
): { mcp_abilities: McpAbilitiesApiStructure } {
	const siteIdNum = Number( siteId );
	const mcpData = userSettings?.mcp_abilities;
	const defaultSiteAbilities = mcpData?.site || {};

	// Check if all abilities are disabled (master toggle off)
	const allAbilitiesDisabled = Object.values( abilities ).every( ( ability ) => ! ability.enabled );

	// Check if all abilities are enabled (master toggle on)
	const allAbilitiesEnabled = Object.values( abilities ).every( ( ability ) => ability.enabled );

	// Find only the abilities that differ from defaults
	const siteOverrides: Record< string, number > = {};
	Object.entries( abilities ).forEach( ( [ abilityName, ability ] ) => {
		const defaultAbility = defaultSiteAbilities[ abilityName ];

		// Only store if it differs from the default
		if ( ! defaultAbility || defaultAbility.enabled !== ability.enabled ) {
			siteOverrides[ abilityName ] = ability.enabled ? 1 : 0;
		}
	} );

	// Create the optimized payload (only include site-specific overrides)
	const payload: McpAbilitiesApiStructure = {};

	// Special case: If all abilities are disabled, we need to explicitly store this state
	// to ensure the master toggle is properly disabled
	if ( allAbilitiesDisabled && Object.keys( abilities ).length > 0 ) {
		// Store all abilities as disabled overrides
		const allDisabledOverrides: Record< string, number > = {};
		Object.keys( abilities ).forEach( ( abilityName ) => {
			allDisabledOverrides[ abilityName ] = 0;
		} );

		payload.sites = {
			[ siteIdNum ]: allDisabledOverrides,
		};
	} else if ( allAbilitiesEnabled && Object.keys( abilities ).length > 0 ) {
		// Special case: If all abilities are enabled, we need to send them to clear any existing disabled overrides
		const allEnabledOverrides: Record< string, number > = {};
		Object.keys( abilities ).forEach( ( abilityName ) => {
			allEnabledOverrides[ abilityName ] = 1;
		} );

		payload.sites = {
			[ siteIdNum ]: allEnabledOverrides,
		};
	} else if ( Object.keys( siteOverrides ).length > 0 ) {
		// Only include site if there are overrides
		payload.sites = {
			[ siteIdNum ]: siteOverrides,
		};
	}

	return { mcp_abilities: payload };
}

/**
 * Custom mutation function for saving MCP abilities that bypasses the saveableKeys filtering
 */
export async function saveMcpAbilities( data: { mcp_abilities: McpAbilitiesApiStructure } ) {
	return await wpcom.req.post( '/me/settings', data );
}
