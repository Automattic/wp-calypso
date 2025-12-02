import type { Badge } from '@automattic/ui';

export type Density = 'low' | 'medium';

/**
 * `badges` property of `SummaryButton` component is used to display `Badge`
 * instances for each array item. For this reason we need to define the props
 * that match the `Badge` component (intent and text).
 */
export type SummaryButtonBadgeProps = {
	/**
	 * Text to display inside the badge.
	 */
	text: string;
	/**
	 * Optional property to specify the intent of the badge.
	 * @default 'default'
	 */
	intent?: React.ComponentProps< typeof Badge >[ 'intent' ];
};

export interface SummaryButtonProps {
	/**
	 * The main label that identifies the setting or feature the button links to.
	 */
	title: React.ReactNode;
	/**
	 * If provided, causes the component to render an `<a />` element
	 * instead of a `<button />` element.
	 */
	href?: string;
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
	 * For now, this property is only rendered in `low` density variant.
	 * We might revisit adding this in more variants in the future.
	 */
	description?: React.ReactNode;
	/**
	 * A brief, optional line of text used to highlight important information,
	 * such as a warning or status.
	 * For now, this property is only rendered in `low` density variant.
	 * We might revisit adding this in more variants in the future.
	 */
	strapline?: string;
	/**
	 * An optional visual element such as an icon or small illustration to enhance
	 * visual context or reinforce the category.
	 */
	decoration?: React.ReactElement;
	/**
	 * This property is used to display `Badge` instances per item. For
	 * this reason we need to define the props that match the `Badge`
	 * component (intent and text).
	 */
	badges?: SummaryButtonBadgeProps[];
	/**
	 * A flag that indicates whether to show an arrow at the UI.
	 * @default true
	 */
	showArrow?: boolean;
	/**
	 * Determines if the element is disabled. If `true`, this will force a `button`
	 * element to be rendered, even when an `href` is given.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Optional class name to be applied to the component.
	 */
	className?: string;
}
