export interface BreadcrumbItemProps {
	/**
	 * The label text for the breadcrumb item.
	 */
	label: string;
	/**
	 * The URL that the breadcrumb item should link to.
	 */
	href?: string;
	/**
	 * An optional callback to handle clicking on this breadcrumb item.
	 */
	onClick?: React.MouseEventHandler;
}

export interface BreadcrumbProps {
	/**
	 * An array of items to display in the breadcrumb trail.
	 * The last item is considered the current page.
	 */
	items: BreadcrumbItemProps[];
	/**
	 * A boolean to show/hide the current page in the trail.
	 * Note that when `false` the current page is only visually hidden.
	 * @default true
	 */
	showCurrentPage?: boolean;
	/**
	 * A flag to force the component to be rendered in a compact
	 * format, by rendering a dropdown of the middle items (if any).
	 * If not set to `true` the component switches to compact mode
	 * and back based on the available space.
	 * @default false
	 */
	isCompact?: boolean;
}
