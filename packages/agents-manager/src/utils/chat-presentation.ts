import { getCanDock } from './can-dock';

/**
 * Document-scoped host presentation. Read before mounting Agents Manager; it is
 * deliberately not persisted alongside the user's chat preferences.
 *
 * `dismissible: false` only holds where the chat can dock. Elsewhere it floats
 * over the page, and a chat that cannot be closed would hide the page for good.
 */
export function getChatPresentation( config = window.__agentsManagerConfig?.chatPresentation ): {
	dismissible: boolean;
	showEntryPoints: boolean;
} {
	return {
		dismissible: config?.dismissible !== false || ! getCanDock(),
		showEntryPoints: config?.showEntryPoints !== false,
	};
}
