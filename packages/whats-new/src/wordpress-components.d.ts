declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const Button: React.ComponentType< Props >;
	export const Modal: React.ComponentType< Props >;
}
