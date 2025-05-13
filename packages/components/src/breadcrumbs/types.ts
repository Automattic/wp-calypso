export interface Item {
	/**
	 * The URL that the breadcrumb item should link to.
	 */
	href: NonNullable< React.AnchorHTMLAttributes< HTMLAnchorElement >[ 'href' ] >;
	/**
	 * The label text for the breadcrumb item.
	 */
	label: string;
}

export type BreadcrumbItemProps = React.AnchorHTMLAttributes< HTMLAnchorElement > & Item;

export interface BreadcrumbProps extends React.HTMLAttributes< HTMLElement > {
	/**
	 * An array of items to display in the breadcrumb trail.
	 * The last item is considered the current item.
	 */
	items: Item[];
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
	 * Allows each breadcrumb item link to be rendered as a different HTML
	 * element or React component. The value is a function that takes in the
	 * original component props and gives back a React element with the props
	 * merged.
	 * This render prop will not affect the last (current) item, since it is
	 * not rendered as an interactive link.
	 *
	 * Note: this render prop should only be used to add behaviors to the
	 * item link (e.g. to connect it to a routing solution). **Do not use this
	 * prop to implement custom breadcrumb item designs.**
	 *
	 * In order to ensure the correct behavior of the component, make sure that
	 * the render prop is open for extension:
	 * - Spread all props onto the underlying element.
	 * - Forward `ref` prop and merge it with the internal ref, if any.
	 * - Merge the `style` and `className` props with the internal styles and classes, if any.
	 * - Chain the event props with the internal event handlers, if any.
	 *
	 * By default, the item link will be rendered as an `a` element.
	 * @example
	 * ```tsx
	 * <Breadcrumbs
	 *   items={ items }
	 *   renderItemLink={ ( props ) => (
	 *     <Link to={ props.href }>{ props.label }</Link>
	 *   ) }
	 * </Breadcrumbs>
	 *
	 * @default ( props ) => <a { ...props }>{ props.label }</a>
	 */
	renderItemLink?: (
		props: BreadcrumbItemProps & {
			ref?: React.Ref< HTMLAnchorElement >;
		}
	) => React.ReactElement;
}
