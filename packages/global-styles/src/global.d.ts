declare module '@wordpress/block-editor' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __unstableIframe: React.ComponentType< Props >;
	export const __unstableEditorStyles: React.ComponentType< Props >;
}

declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __experimentalHStack: React.ComponentType< Props >;
	export const __experimentalVStack: React.ComponentType< Props >;
}

declare module '@wordpress/edit-site/build-module/components/global-styles/context';
declare module '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
declare module '@wordpress/edit-site/build-module/components/global-styles/hooks';
declare module '@wordpress/edit-site/build-module/components/global-styles/preview';
declare module '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
