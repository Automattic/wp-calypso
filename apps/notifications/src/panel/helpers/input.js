export const keys = {
	KEY_A: 65,
	KEY_E: 69,
	KEY_L: 76,
	KEY_S: 83,
	KEY_T: 84,
};

export const modifierKeyIsActive = ( e ) => {
	return e.altKey || e.ctrlKey || e.metaKey;
};

/**
 * Whether a key press types into a field. Typing never runs a shortcut, whatever the shared switch
 * says: the Dashboard's panel stays open while the focus moves to the omnibar, and from there into
 * a field such as the command palette's search.
 */
export const isTyping = ( { target } ) =>
	target instanceof HTMLElement &&
	( target.isContentEditable || [ 'INPUT', 'SELECT', 'TEXTAREA' ].includes( target.tagName ) );
