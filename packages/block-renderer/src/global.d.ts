declare module '@wordpress/block-editor' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const store: any;
	export const __unstableIframe: React.ComponentType< Props >;
	export const __unstableEditorStyles: React.ComponentType< Props >;
	export const privateApis: Record< string, unknown >;
}
