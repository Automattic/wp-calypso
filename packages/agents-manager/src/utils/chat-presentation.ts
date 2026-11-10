/**
 * Document-scoped host presentation. Read before mounting Agents Manager; it is
 * deliberately not persisted alongside the user's chat preferences.
 */
export function getChatPresentation( config = window.__agentsManagerConfig?.chatPresentation ): {
	dismissible: boolean;
	showEntryPoints: boolean;
} {
	return {
		dismissible: config?.dismissible !== false,
		showEntryPoints: config?.showEntryPoints !== false,
	};
}
