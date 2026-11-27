let mountedPanels = 0;

/**
 * Marks the panel as mounted until the returned function is called.
 */
export function markPanelMounted(): () => void {
	mountedPanels++;

	return () => {
		mountedPanels--;
	};
}

/**
 * Whether a panel is mounted, such as the Dashboard's bell panel opened over the full page.
 */
export const isPanelMounted = () => mountedPanels > 0;
