/**
 * Gutenberg Editor Settings
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/store/defaults.js
 */

export function editorSettings( isRTL: boolean ) {
	return {
		disableCustomColors: false,
		disableCustomFontSizes: false,
		disablePostFormats: true,
		isDistractionFree: false,
		isRTL,
		autosaveInterval: 60,
		codeEditingEnabled: false,
		bodyPlaceholder: 'Leave a comment',
		supportsLayout: false,
		colors: [],
		fontSizes: [],
		imageDefaultSize: 'medium',
		imageSizes: [],
		imageEditing: false,
		hasFixedToolbar: true,
		maxWidth: 580,
		allowedBlockTypes: true,
		maxUploadFileSize: 0,
		allowedMimeTypes: null,
		canLockBlocks: false,
		enableOpenverseMediaCategory: false,
		clearBlockSelection: true,
		__experimentalCanUserUseUnfilteredHTML: false,
		__experimentalBlockDirector: false,
		__mobileEnablePageTemplates: false,
		__experimentalBlockPatterns: [],
		__experimentalBlockPatternCategories: [],
		__unstableGalleryWithImageBlocks: false,
		isPreviewMode: false,
		blockInspectorAnimation: {},
		generateAnchors: false,
		gradients: [],
		__unstableResolvedAssets: {
			styles: [],
			scripts: [],
		},
	};
}
