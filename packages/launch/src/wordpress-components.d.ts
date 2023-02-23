declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const Button: React.ComponentType< Props >;
	export const Circle: React.ComponentType< Props >;
	export const ClipboardButton: React.ComponentType< Props >;
	export const Modal: React.ComponentType< Props >;
	export const Path: React.ComponentType< Props >;
	export const Rect: React.ComponentType< Props >;
	export const SVG: React.ComponentType< Props >;
	export const Tooltip: React.ComponentType< Props >;
	export const TextControl: React.ComponentType< Props >;

	export namespace Button {
		export interface ButtonProps {
			[ key: string ]: unknown;
			className?: string;
		}
	}
}
