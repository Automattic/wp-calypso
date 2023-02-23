declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const Button: React.ComponentType< Props >;
	export const FormFileUpload: React.ComponentType< Props >;
	export const TextControl: React.ComponentType< Props >;
}
