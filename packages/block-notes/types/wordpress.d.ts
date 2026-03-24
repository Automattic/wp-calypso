// Type declarations for WordPress packages without types
declare module '@wordpress/block-editor' {
	export const BlockControls: any;
	export const store: any;
}

// Global data injected by PHP
interface BlockNotesData {
	enabled: boolean;
}

interface Window {
	blockNotesData?: BlockNotesData;
	_currentSiteId?: number;
	Jetpack_Editor_Initial_State?: {
		wpcomBlogId: string;
	};
}
