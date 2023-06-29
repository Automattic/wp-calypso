declare module '@wordpress/block-editor' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __unstableIframe: React.ComponentType< Props >;
	export const __unstableEditorStyles: React.ComponentType< Props >;

	export const privateApis: unknown;
	export const transformStyles: ( styles: unknown[], wrapperClassName: string ) => string;
}
