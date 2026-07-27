declare const __i18n_text_domain__: string;

// Type declarations for WordPress packages without types
declare module '@wordpress/block-editor' {
	export const BlockControls: any;
	export const store: any;
}

// Global data injected by PHP
interface AiBlockNotesData {
	enabled: boolean;
}

interface Window {
	aiBlockNotesData?: AiBlockNotesData;
	/** @deprecated Compatibility with Jetpack versions released before the AI Block Notes rename. */
	blockNotesData?: AiBlockNotesData;
	_currentSiteId?: number;
	Jetpack_Editor_Initial_State?: {
		wpcomBlogId: string;
	};
}
