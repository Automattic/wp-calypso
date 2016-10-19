export const siteShortcodeSchema = {
	type: 'object',
	properties: {
		body: { type: 'string' },
		scripts: { type: 'object' },
		styles: { type: 'object' }
	}
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
