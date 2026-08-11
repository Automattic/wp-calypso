/**
 * WordPress Abilities API integration for Agenttic Client
 *
 * This module provides utilities to integrate WordPress Abilities API
 * abilities with the Agenttic tool system.
 */

import type { Ability, Tool } from '../client/types';

/**
 * Extended Tool interface to track WordPress Ability origin
 */
interface AbilityTool extends Tool {
	_source?: 'wordpress-ability';
	_originalAbility?: Ability;
}

/**
 * Convert a single WordPress Ability to an Agenttic Tool.
 *
 * @param ability The WordPress Ability to convert
 * @returns The converted Tool object
 */
export function convertAbilityToTool( ability: Ability ): AbilityTool {
	// Provide a default input schema if none is defined, since Tool requires it but ability does not
	const defaultSchema: Tool[ 'input_schema' ] = {
		type: 'object',
		properties: {},
	};

	// WordPress Abilities use "/" as namespace separator (e.g., "test-woo/get-store-status"),
	// but tool IDs must match the pattern ^[a-zA-Z0-9_-]{1,64}$.
	// We convert "/" to "-" to maintain compatibility while preserving the original name
	// for ability execution.
	const toolId = ability.name.replace( /\//g, '-' );

	return {
		id: toolId,
		name: ability.label,
		description: ability.description,
		input_schema: ( ability.input_schema as Tool[ 'input_schema' ] ) || defaultSchema,
		// Store metadata for detection and execution
		_source: 'wordpress-ability',
		_originalAbility: ability,
	};
}

/**
 * Convert an array of WordPress Abilities to Agenttic Tools.
 *
 * @param abilities Array of WordPress Abilities
 * @returns Array of converted Tool objects
 */
export function convertAbilitiesToTools( abilities: Ability[] ): Tool[] {
	return abilities.map( convertAbilityToTool );
}

/**
 * Check if a tool was converted from a WordPress Ability.
 *
 * @param tool The tool to check
 * @returns True if the tool originated from a WordPress Ability
 */
export function isWordPressAbility( tool: any ): tool is AbilityTool {
	return tool?._source === 'wordpress-ability';
}
