type Density = 'low' | 'medium';

/**
 * `fields` property of `SummaryButton` component is used to display
 * `CoreBadge` instances per field. For this reason we need to define
 * the props that match the `CoreBadge` component (intent and text).
 */
export type SummaryButtonFieldProps = {
	/**
	 * Text to display inside the badge.
	 */
	text: string;
	/**
	 * Optional property to specify the color of the badge.
	 * @default 'default'
	 */
	intent?: 'default' | 'info' | 'success' | 'warning' | 'error';
};

export interface SummaryButtonProps {
	/**
	 * The main label that identifies the setting or feature the button links to.
	 */
	title: string;
	/**
	 * If provided, causes the component to render an `<a />` element
	 * instead of a `<button />` element. It's mapped to the `href` property.
	 */
	to?: string;
	/**
	 * A callback to handle clicking an item.
	 */
	onClick?: React.MouseEventHandler;
	/**
	 * Adjusts spacing and layout. Higher density reduces padding and may hide
	 * optional elements like the description to create a more compact appearance.
	 */
	density?: Density;
	/**
	 * Optional supporting text that provides additional context or detail about the linked page.
	 */
	description?: string;
	/**
	 * A brief, optional line of text used to highlight important information,
	 * such as a warning or status.
	 */
	strapline?: string;
	/**
	 * An optional visual element such as an icon or small illustration to enhance
	 * visual context or reinforce the category.
	 */
	decoration?: React.ReactElement;
	/**
	 * This property is used to display `CoreBadge` instances per field. For
	 * this reason we need to define the props that match the `CoreBadge`
	 * component (intent and text).
	 */
	fields?: SummaryButtonFieldProps[];
	/**
	 * A flag that indicates whether the button leads to a deeper level of navigation
	 * or a separate detail page. When `true` it shows a chevron at the UI.
	 * @default true
	 */
	// TODO: rename, revisit this param..
	leadsToNestedPage?: boolean;
	/**
	 * Determines if the element is disabled. If `true`, this will force a `button`
	 * element to be rendered, even when an `href` is given.
	 * @default false
	 */
	disabled?: boolean;
}
