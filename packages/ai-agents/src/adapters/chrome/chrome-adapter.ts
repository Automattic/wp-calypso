/**
 * Chrome Adapter Interface
 *
 * Handles DOM manipulation and styling for the agent dock in different contexts.
 * Different implementations handle context-specific chrome management (WP Admin, Block Editor, Calypso, etc.)
 */
export interface ChromeAdapter {
	/**
	 * Apply chrome styles/classes when dock state changes
	 *
	 * @param {boolean} isDocked - Whether the agent is docked (vs floating)
	 * @param {boolean} isCollapsed - Whether the chat is collapsed
	 */
	applyChrome( isDocked: boolean, isCollapsed: boolean ): void;

	/**
	 * Remove all chrome styles/classes (cleanup)
	 */
	removeChrome(): void;

	/**
	 * Get the container selector for this context
	 *
	 * @returns {string} CSS selector or element identifier for the main container
	 */
	getContainerSelector(): string;

	/**
	 * Optional: Initialize any necessary DOM elements or styles
	 */
	initialize?(): void;

	/**
	 * Optional: Cleanup any injected elements or styles
	 */
	cleanup?(): void;
}
