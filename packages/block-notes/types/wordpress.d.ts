// Type declarations for WordPress packages without types
declare module '@wordpress/block-editor' {
	export const BlockControls: any;
	export const store: any;
}

// Global data injected by PHP
interface BlockNotesData {
	enabled: boolean;
	siteId?: number;
}

interface Window {
	blockNotesData?: BlockNotesData;
}
