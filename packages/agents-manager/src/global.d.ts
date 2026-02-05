/**
 * Global type declarations for the Agents Manager package.
 */

/**
 * agentsManagerData is set as a global const via wp_add_inline_script
 * in Jetpack's Agents Manager feature.
 */
declare const agentsManagerData:
	| {
			agentProviders?: string[];
			useUnifiedExperience?: boolean;
	  }
	| undefined;

declare module '@wordpress/block-editor' {
	import type { StoreDescriptor } from '@wordpress/data';
	interface BlockEditorSelectors {
		getSelectedBlock(): {
			name: string;
			attributes?: {
				content?: {
					text?: string;
				};
			};
		} | null;
	}

	interface BlockEditorActions {
		clearSelectedBlock(): void;
	}

	export const store: StoreDescriptor< BlockEditorSelectors, BlockEditorActions >;
	export const BlockIcon: React.ComponentType< { icon: any } >;
}

/**
 * Extend Window interface for cross-bundle access to agentManager.
 * Used by components like Image Studio that need to access the shared agent.
 */
interface Window {
	__agentManager?: import('@automattic/agenttic-client').AgentManager;
}
