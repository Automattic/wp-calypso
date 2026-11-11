/**
 * Utilities for working with Odie bot IDs and configuration
 */

export interface OdieBotConfig {
	product: string; // e.g., 'wpcom'
	type: 'agent' | 'workflow' | 'chain';
	slug: string; // e.g., 'wp_orchestrator' (with underscores)
	agentId: string; // e.g., 'wp-orchestrator' (with hyphens, matches AGENT_ID)
}

/**
 * Create an Odie bot ID from an agent ID.
 * Converts agent ID format (with hyphens) to bot ID format.
 * @param agentId - The agent ID (e.g., 'wp-orchestrator')
 * @param type    - Bot type (default: 'agent')
 * @param product - Product name (default: 'wpcom')
 * @returns Full Odie bot ID (e.g., 'wpcom-agent-wp_orchestrator')
 * @example
 * createOdieBotId('wp-orchestrator')
 * // Returns: 'wpcom-agent-wp_orchestrator'
 *
 * createOdieBotId('my-bot', 'workflow', 'myproduct')
 * // Returns: 'myproduct-workflow-my_bot'
 */
export function createOdieBotId(
	agentId: string,
	type: 'agent' | 'workflow' | 'chain' = 'agent',
	product: string = 'wpcom'
): string {
	// Convert agent ID (with hyphens) to bot slug (with underscores)
	const botSlug = agentId.replace( /-/g, '_' );

	// Construct full bot ID: {product}-{type}-{slug}
	return `${ product }-${ type }-${ botSlug }`;
}

/**
 * Parse an Odie bot ID back into its components.
 * @param odieBotId - The full Odie bot ID (e.g., 'wpcom-agent-wp_orchestrator')
 * @returns Parsed bot configuration with all components
 * @example
 * parseOdieBotId('wpcom-agent-wp_orchestrator')
 * // Returns: {
 * //   product: 'wpcom',
 * //   type: 'agent',
 * //   slug: 'wp_orchestrator',
 * //   agentId: 'wp-orchestrator'
 * // }
 */
export function parseOdieBotId( odieBotId: string ): OdieBotConfig {
	const parts = odieBotId.split( '-' );

	if ( parts.length < 3 ) {
		throw new Error(
			`Invalid Odie bot ID format: ${ odieBotId }. Expected format: {product}-{type}-{slug}`
		);
	}

	// First part is product, second is type, rest is slug
	const product = parts[ 0 ];
	const typeString = parts[ 1 ];

	// Validate type - fail fast if invalid
	if ( ! [ 'agent', 'workflow', 'chain' ].includes( typeString ) ) {
		throw new Error(
			`Invalid Odie bot type: ${ typeString }. Expected one of: agent, workflow, chain`
		);
	}

	const type = typeString as 'agent' | 'workflow' | 'chain';
	const slug = parts.slice( 2 ).join( '-' ); // Rejoin in case slug has hyphens

	// Convert bot slug (with underscores/hyphens) back to agent ID (with hyphens)
	const agentId = slug.replace( /_/g, '-' );

	return {
		product,
		type,
		slug,
		agentId,
	};
}

/**
 * Check if a string is a valid Odie bot ID format.
 * @param value - String to check
 * @returns True if valid Odie bot ID format
 * @example
 * isOdieBotId('wpcom-agent-wp_orchestrator') // true
 * isOdieBotId('just-a-string') // false
 */
export function isOdieBotId( value: string ): boolean {
	try {
		const parsed = parseOdieBotId( value );
		return (
			parsed.product.length > 0 &&
			[ 'agent', 'workflow', 'chain' ].includes( parsed.type ) &&
			parsed.slug.length > 0
		);
	} catch {
		return false;
	}
}
