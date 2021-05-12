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
