// Import-free on purpose: host apps deep-import this module, so it must not pull
// the rest of the package (or its dependencies) into their bundles.

// ExPlat experiment: "Get Help" entry-point label + chat-forward Odie opening.
// Assignments are resolved by host apps (the packages have no ExPlat access).
export const HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT =
	'calypso_help_center_get_help_chat_forward';
