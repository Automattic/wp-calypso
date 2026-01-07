export type BadgeProps = {
	/**
	 * Badge variant.
	 *
	 * @default 'default'
	 */
	intent?: 'default' | 'info' | 'success' | 'warning' | 'error';
	/**
	 * Text to display inside the badge.
	 */
	children: string;
	/**
	 * Custom icon to display inside the badge. Use `null` to hide the icon.
	 */
	icon?: JSX.Element | null;
};
