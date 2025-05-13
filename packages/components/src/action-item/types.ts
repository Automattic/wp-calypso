export interface ActionItemProps {
	/**
	 * The main label that identifies the action.
	 */
	title: string;
	/**
	 * Optional supporting text that provides additional context or detail about the action.
	 */
	description?: string;
	/**
	 * An optional visual element such as an icon or small illustration to enhance
	 * visual context or reinforce the category.
	 */
	decoration?: React.ReactElement;
	/**
	 * The action label.
	 */
	actionLabel: string;
	/**
	 * Renders a red text-based button style to indicate destructive behavior.
	 */
	isDestructive?: boolean;
	/**
	 * A callback to handle clicking an item.
	 */
	onClick?: React.MouseEventHandler;
}
