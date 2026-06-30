declare module '@wordpress/block-editor' {
	export const BlockControls: import('react').ComponentType< {
		children?: import('react').ReactNode;
		group?: string;
	} >;
}

/**
 * Text domain placeholder replaced at build time by the Agents Manager
 * webpack DefinePlugin (resolves to 'default').
 */
declare const __i18n_text_domain__: string;

/**
 * Global data injected by the Agents Manager host script.
 */
declare const agentsManagerData:
	| {
			jetpackAiSidebar?: {
				enabled: boolean;
				features?: {
					aiEditorialReview?: boolean;
					generateFeedback?: boolean;
					blockTransformations?: boolean;
					blockToolbarButton?: boolean;
					optimizeTitleSuggestion?: boolean;
				};
			};
	  }
	| undefined;

declare module '@wordpress/block-editor' {
	import type { StoreDescriptor } from '@wordpress/data';

	interface BlockEditorSelectors {
		getSelectedBlockClientId(): string | null;
	}

	interface BlockEditorActions {
		selectBlock( clientId: string, initialPosition?: 0 | -1 | null ): void;
		clearSelectedBlock(): void;
	}

	export const store: StoreDescriptor< BlockEditorSelectors, BlockEditorActions >;
}
