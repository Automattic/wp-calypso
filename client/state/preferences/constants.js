export const USER_SETTING_KEY = 'calypso_preferences';
export const DEFAULT_PREFERENCES = {
	'editor-mode': {
		save: true,
		schema: { enum: [ null, 'html', 'tinymce' ] },
		default: null
	},
	'mediaModalGalleryInstructionsDismissed': {
		save: true,
		schema: { type: "boolean" },
		default: false
	},
	'mediaModalGalleryInstructionsDismissedForSession': {
		save: false,
		schema: null, //We dont want to persist - it's for session
		default: false
	}
};
