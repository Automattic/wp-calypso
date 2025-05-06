export interface BreadcrumbItemProps {
	/**
	 * The label text for the breadcrumb item.
	 */
	label: string;
	/**
	 * The URL that the breadcrumb item should link to.
	 */
	href: string;
	/**
	 * An optional callback to handle clicking on this breadcrumb item.
	 */
	onClick?: React.MouseEventHandler;
}

export interface BreadcrumbProps {
	/**
	 * An array of items to display in the breadcrumb trail.
	 * The last item is considered the current item.
	 */
	items: BreadcrumbItemProps[];
	/**
	 * A boolean to show/hide the current item in the trail.
	 * Note that when `false` the current item is only visually hidden.
	 * @default false
	 */
	showCurrentItem?: boolean;
	/**
	 * The size of the breadcrumbs component.
	 * - default: The component switches to compact mode and back based on the available space.
	 * - compact: Forces the component to be rendered in a compact format, by rendering a dropdown
	 *   of the middle items (if any).
	 * @default 'default'
	 */
	size?: 'default' | 'compact';
}
