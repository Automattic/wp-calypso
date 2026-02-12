// Type declarations for WordPress packages without types
declare module '@wordpress/block-editor' {
	export const BlockControls: any;
	export const MediaUpload: any;
	export const MediaUploadCheck: any;
	export const store: any;
	export function useBlockEditContext(): { name: string; isSelected: boolean };
}
