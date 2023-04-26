declare module '@wordpress/block-editor' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const store: any;
	export const __unstableIframe: React.ComponentType< Props >;
	export const __unstableEditorStyles: React.ComponentType< Props >;
	export const __unstablePresetDuotoneFilter: React.ComponentType< Props >;
}

declare module '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
