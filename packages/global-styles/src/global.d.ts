declare module '@wordpress/block-editor' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __unstableIframe: React.ComponentType< Props >;
	export const __unstableEditorStyles: React.ComponentType< Props >;

	export const privateApis: unknown;
}

declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __unstableComposite: React.ComponentType< Props >;
	export const __unstableCompositeItem: React.ComponentType< Props >;
	export const __unstableMotion: React.ComponenType< Props >;
	export const __unstableUseCompositeState: ( props?: {
		orientation?: 'horizontal' | 'vertical';
	} ) => any;
	export const __experimentalHStack: React.ComponentType< Props >;
	export const __experimentalVStack: React.ComponentType< Props >;
}
