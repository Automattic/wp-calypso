declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const Button: React.ComponentType< Props >;
	export const Dropdown: React.ComponentType< Props >;
	export const DropdownMenu: React.ComponentType< Props >;
	export const Icon: React.ComponentType< Props >;
	export const MenuGroup: React.ComponentType< Props >;
	export const MenuItem: React.ComponentType< Props >;
	export const Panel: React.ComponentType< Props >;
	export const PanelBody: React.ComponentType< Props >;
	export const PanelRow: React.ComponentType< Props >;
	export const Popover: React.ComponentType< Props >;
	export const Rect: React.ComponentType< Props >;
	export const SVG: React.ComponentType< Props >;
	export const Toolbar: React.ComponentType< Props >;
	export const ToolbarButton: React.ComponentType< Props >;
	export const ToolbarGroup: React.ComponentType< Props >;

	export namespace Button {
		export interface Props {
			[ key: string ]: unknown;
		}
	}

	export namespace Popover {
		export interface Props {
			[ key: string ]: unknown;
		}
	}

	export namespace ToolbarButton {
		export interface Props {
			[ key: string ]: unknown;
		}
	}
}
