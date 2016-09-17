export const siteShortcodeSchema = {
	type: 'object',
};

export const siteShortcodesSchema = {
	type: 'object',
	patternProperties: {
		'^.+$': { ...siteShortcodeSchema }
	}
};

export const shortcodesSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': { ...siteShortcodesSchema }
	}
};
