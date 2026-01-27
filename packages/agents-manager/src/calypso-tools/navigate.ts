/**
 * Calypso Navigation Tool
 *
 * Enables the agent to navigate within Calypso using SPA routing (no page reload).
 * Uses react-router-dom's useNavigate hook for seamless navigation.
 */

import type { Ability, NavigateArgs, NavigateResult, CalypsoToolActions } from './types';

/**
 * Tool definition for Calypso navigation
 */
export const navigateAbility: Ability = {
	name: 'calypso/navigate',
	label: 'Navigate to Calypso page',
	category: 'calypso',
	description:
		'Navigate to a different page in Calypso using SPA navigation (no page reload). ' +
		'Use this when the user asks to go to a specific page like posts, pages, settings, etc.',
	input_schema: {
		type: 'object',
		properties: {
			path: {
				type: 'string',
				description:
					'The Calypso path to navigate to (e.g., "/posts/example.com", "/settings/general/example.com", "/home/example.com")',
			},
		},
		required: [ 'path' ],
	},
	meta: {
		annotations: {
			readonly: false,
			destructive: false,
			idempotent: true,
		},
		frontend_callback: true,
	},
};

/**
 * Execute the navigate tool
 *
 * @param args - Navigation arguments
 * @param actions - Actions with access to React context
 * @returns Navigation result
 */
export function executeNavigate( args: NavigateArgs, actions: CalypsoToolActions ): NavigateResult {
	const { path } = args;

	// Validate path
	if ( ! path || typeof path !== 'string' ) {
		throw new Error( 'Invalid path: must be a non-empty string' );
	}

	// Ensure path starts with /
	const normalizedPath = path.startsWith( '/' ) ? path : `/${ path }`;

	// Execute navigation using the action that has access to useNavigate
	actions.navigate( normalizedPath );

	return {
		success: true,
		path: normalizedPath,
	};
}
