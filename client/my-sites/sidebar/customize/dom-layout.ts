const NON_LAYOUT_ROW_SELECTOR = [
	'.admin-sidebar-drop-indicator',
	'.sidebar__region',
	'.collapse-sidebar__toggle',
	'.wp-admin-sidebar-group',
].join( ',' );

export function layoutRowsForContainer( container: Element ): Element[] {
	return Array.from( container.children ).filter(
		( child ) => child.tagName === 'LI' && ! child.matches( NON_LAYOUT_ROW_SELECTOR )
	);
}

export function layoutIndexOf( container: Element, li: Element ): number {
	return layoutRowsForContainer( container ).indexOf( li );
}
