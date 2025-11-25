import { createOdieBotId } from '@automattic/agenttic-client';
import { executeAbility, getAbilities } from '@wordpress/abilities';
import { createCalypsoAuthProvider } from '../auth/calypso-auth-provider';
import { ProductCard } from '../components/product-card';
import { getClientContext } from './client-context';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions } from '@automattic/agenttic-ui';

export const API_BASE_URL = 'https://public-api.wordpress.com';
export const AGENT_URL = 'https://public-api.wordpress.com/wpcom/v2/ai/agent';
export const AGENT_ID = 'wp-orchestrator';
export const SESSION_ID_STORAGE_KEY = 'agents-manager-orchestrator-session-id';

/**
 * Allowlist of abilities to expose to the agent
 */
const ALLOWED_ABILITIES = [
	'ciab-admin/navigate',
	'wp-admin/navigate',
	'woocommerce/get-order',
	'woocommerce/create-product',
	'woocommerce/update-product',
	'woocommerce/create-bookable-product',
	'ciab-admin/update-product',
	'image-studio/update-canvas-image',
	'image-studio/render-images',
];

/**
 * Create agent configuration with abilities loaded.
 * @param sessionId Session ID for the agent chat
 * @returns Promise resolving to complete UseAgentChatConfig
 */
export async function createAgentConfig(
	sessionId: string,
	siteId?: number
): Promise< UseAgentChatConfig > {
	const config = {
		agentId: AGENT_ID,
		agentUrl: AGENT_URL,
		sessionId,
		sessionIdStorageKey: SESSION_ID_STORAGE_KEY,
		authProvider: createCalypsoAuthProvider( siteId ),
		contextProvider: {
			getClientContext,
		},
		toolProvider: {
			getAbilities: async () => {
				try {
					const allAbilities = await getAbilities();
					const filtered = allAbilities.filter( ( ability ) =>
						ALLOWED_ABILITIES.includes( ability.name )
					);
					// Fix type mismatch between @wordpress/abilities and @automattic/agenttic-client
					// @wordpress/abilities allows null for boolean fields, but agenttic-client expects boolean | undefined
					return filtered.map( ( ability ) => ( {
						...ability,
						meta: ability.meta
							? {
									...ability.meta,
									annotations: ability.meta.annotations
										? {
												...ability.meta.annotations,
												readonly: ability.meta.annotations.readonly ?? undefined,
												destructive: ability.meta.annotations.destructive ?? undefined,
												idempotent: ability.meta.annotations.idempotent ?? undefined,
										  }
										: undefined,
							  }
							: undefined,
					} ) );
				} catch ( error ) {
					return [];
				}
			},
			executeAbility: async ( abilityName: string, args: any ) => {
				const result = await executeAbility( abilityName, args );
				return {
					...result,
					returnToAgent: result?.followUpTasks ?? true,
				};
			},
		},
		enableStreaming: true,
		// Enable server-based conversation storage via Odie
		// Converts AGENT_ID 'wp-orchestrator' to bot ID 'wpcom-agent-wp_orchestrator'
		odieBotId: createOdieBotId( AGENT_ID ),
	};

	return config;
}

/**
 * Get available markdown extensions for Agents Manager
 * This function provides Agents Manager-specific markdown extensions
 * @returns {MarkdownExtensions} Markdown extensions configuration
 */
function getMarkdownExtensions(): MarkdownExtensions {
	return {
		// Enable GitHub Flavored Markdown for basic formatting
		gfm: { enabled: true },
	};
}

/**
 * Get available markdown components for Agents Manager
 * This function provides Agents Manager-specific markdown component renderers
 * @returns {MarkdownComponents} Markdown components configuration
 */
function getMarkdownComponents(): MarkdownComponents {
	return {
		code: ( { className, children, ...props } ) => {
			// Handle product cards from markdown
			if ( className === 'language-product' ) {
				return <ProductCard data={ children as string } />;
			}

			// Default code block handling
			return (
				<code className={ className } { ...props }>
					{ children }
				</code>
			);
		},
	};
}

// Export configuration as default for dynamic import by Next Admin
export default {
	url: AGENT_URL,
	createAgentConfig,
	markdownExtensions: getMarkdownExtensions,
	markdownComponents: getMarkdownComponents,
};
