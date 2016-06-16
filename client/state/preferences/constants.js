export const USER_SETTING_KEY = 'calypso_preferences';
export const DEFAULT_PREFERENCES = {
	'editor-mode': {
		schema: { enum: [ null, 'html', 'tinymce' ] },
		default: null
	},
	'mediaModalGalleryInstructionsDismissed': {
		schema: { type: "boolean" },
		default: false
	},
	'mediaModalGalleryInstructionsDismissedForSession': {
		schema: null, //We dont want to persist - it's for session
		default: false
	}
};
