export { ImageStudioEntryPoint } from '../store/index';

export interface ImageStudioConfig {
	attachmentId?: number;
	imageData?: {
		id: number;
		url: string;
		title: string;
		caption: string;
		alt: string;
		width?: number;
		height?: number;
		description?: string;
		filename?: string;
	};
}

import type { AgentConfigFactory } from '../utils/agent-config';

export interface ImageStudioProps {
	image: File | string;
	/** Save current image as checkpoint (modal stays open) */
	onSave: () => Promise< void > | void;
	/** Handle discard logic (restore original, clear checkpoint) */
	onDiscard: () => Promise< void > | void;
	/** Exit modal (cleanup, close) */
	onExit: () => Promise< void > | void;
	/** Navigate to Media Library editor (save, cleanup, navigate) */
	onClassicMediaEditorNavigation?: ( url: string ) => Promise< void >;
	/** Navigate to previous image in media library */
	onNavigatePrevious?: () => void;
	/** Navigate to next image in media library */
	onNavigateNext?: () => void;
	/** Whether there is a previous image available */
	hasPreviousImage?: boolean;
	/** Whether there is a next image available */
	hasNextImage?: boolean;
	className?: string;
	config: ImageStudioConfig;
	agentConfigFactory?: AgentConfigFactory;
}

export enum ImageStudioMode {
	Edit = 'edit',
	Generate = 'generate',
}

export enum ToolbarOption {
	Annotate = 'annotate',
	AltText = 'alt-text',
}

export enum MetadataField {
	Title = 'title',
	Caption = 'caption',
	Description = 'description',
	AltText = 'alt_text',
}

/**
 * Supported image MIME types for Image Studio.
 * Keep in sync with the list in https://github.a8c.com/Automattic/wpcom/blob/14f1b110a11250b6a1834a31376c9a9f68ff1b0a/wp-content/lib/ai/tools/big-sky/images/class.image-utils.php#L783
 */
export const IMAGE_STUDIO_SUPPORTED_MIME_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/bmp',
	'image/tiff',
] as const;
