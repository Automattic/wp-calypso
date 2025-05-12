export interface BreadcrumbItemProps extends React.AnchorHTMLAttributes< HTMLAnchorElement > {
	/**
	 * The URL that the breadcrumb item should link to.
	 */
	href: string;
	/**
	 * The label text for the breadcrumb item.
	 */
	label: string;
}

export type RenderLink = ( props: BreadcrumbItemProps ) => React.ReactElement;

export interface BreadcrumbProps extends React.HTMLAttributes< HTMLElement > {
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
	 * The variant of the breadcrumbs component.
	 * - default: The component switches to compact mode and back based on the available space.
	 * - compact: Forces the component to be rendered in a compact format, by rendering a dropdown
	 *   of the middle items (if any).
	 * @default 'default'
	 */
	variant?: 'default' | 'compact';
	/**
	 * An optional function to render a custom link for each breadcrumb item.
	 * This function receives the breadcrumb item as an argument and should return a React node.
	 * @param props - The breadcrumb item props.
	 * @returns A customized ReactElement link.
	 * @example
	 * ```tsx
	 * <Breadcrumbs
	 *   items={ items }
	 *   renderLink={ ( props ) => (
	 *     <Link to={ props.href }>{ props.label }</Link>
	 *   ) }
	 * </Breadcrumbs>
	 */
	renderLink?: RenderLink;
}
