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
