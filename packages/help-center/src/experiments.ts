// Import-free on purpose: host apps deep-import this module, so it must not pull
// the rest of the package (or its dependencies) into their bundles.

// ExPlat experiment: "Get Help" entry-point label + chat-forward Odie opening.
// The backend assigns it and renders the label; hosts only relay what it sent.
export const HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT =
	'calypso_help_center_get_help_chat_forward';

type AdminBarNode = { id: string; meta?: { menu_title?: string } };

/**
 * Reads the experiment arm off the admin bar payload: the backend gives the help
 * entry point a label only in the treatment. Returns undefined while the payload
 * is unresolved, so hosts can leave the key out rather than claim a variation.
 */
export function getHelpCenterExperimentVariations(
	adminBarNodes: AdminBarNode[] | undefined
): Record< string, string | null > | undefined {
	if ( ! adminBarNodes ) {
		return undefined;
	}

	const helpCenterNode = adminBarNodes.find( ( node ) => node.id === 'help-center' );

	return {
		[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ]: helpCenterNode?.meta?.menu_title
			? 'treatment'
			: null,
	};
}
