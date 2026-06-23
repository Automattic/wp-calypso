/**
 * Global data injected by the Agents Manager host script.
 */
declare const agentsManagerData:
	| {
			aiEditorialReviewEnabled?: boolean;
			reviewMediatorEnabled?: boolean;
			jetpackAiSidebarPreview?: {
				enabled: boolean;
				features?: {
					aiEditorialReview?: boolean;
					generateFeedback?: boolean;
					blockTransformations?: boolean;
					optimizeTitleSuggestion?: boolean;
					chatHistory?: boolean;
					supportGuides?: boolean;
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
