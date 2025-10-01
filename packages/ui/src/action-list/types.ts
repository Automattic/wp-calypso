export interface ActionItemProps {
	/**
	 * The main label that identifies the action.
	 */
	title: string;

	/**
	 * Optional supporting text that provides additional context or
	 * detail about the action.
	 */
	description?: string;

	/**
	 * An optional visual element such as an icon or small illustration
	 * to enhance recognition or provide visual interest.
	 */
	decoration?: React.ReactNode;

	/**
	 * Renders a button that invokes the related action.
	 */
	actions: React.ReactNode;

	/**
	 * Additional class name to apply to the action item container.
	 */
	className?: string;

	/**
	 * Indicates the current status of the action item.
	 */
	status?: 'complete' | 'disabled';
}

export interface ActionListProps {
	/**
	 * The main label that identifies the action list.
	 */
	title?: string;

	/**
	 * Optional supporting text that provides additional context or
	 * detail about the action list.
	 */
	description?: string;

	/**
	 * The elements, which should include one instance of the `ActionList.ActionItem`
	 * component.
	 */
	children: React.ReactNode;

	/**
	 * Additional class name to apply to the action item container.
	 */
	className?: string;
}
