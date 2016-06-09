export const USER_SETTING_KEY = 'calypso_preferences';
export const DEFAULT_PREFERENCES = {
	'editor-mode': {
		schema: { enum: [ null, 'html', 'tinymce' ] },
		default: null
	}
};
