/**
 * Client Context for Image Studio
 *
 * Provides context about the current Image Studio state to the AI agent.
 */
import { select } from '@wordpress/data';
import { store as imageStudioStore } from '../store';

export interface ImageStudioMetadata {
	id?: number;
	title?: string;
	alt?: string;
	width?: number;
	height?: number;
	description?: string;
}

export interface ImageStudioData {
	isOpen: boolean;
	id: number | null;
	style?: string;
	metadata: ImageStudioMetadata;
}

export interface ImageStudioClientContext extends Record< string, unknown > {
	url: string;
	pathname: string;
	search: string;
	environment: 'wp-admin';
	imageStudio?: ImageStudioData;
}

/**
 * Detect and extract image entity context when Image Studio is open.
 *
 * Note: We intentionally do NOT send the URL in context to prevent agent retry loops.
 * The backend fetches the current URL from the clientId (attachmentId) via
 * resolve_image_studio_url().
 */
function detectImageEntity(): ImageStudioData | null {
	try {
		const storeSelect = select( imageStudioStore ) as any;
		if ( ! storeSelect ) {
			return null;
		}

		const attachmentId = storeSelect.getImageStudioAttachmentId?.();
		const isOpen = storeSelect.getIsImageStudioOpen?.() || false;
		const selectedStyle = storeSelect.getSelectedStyle?.() || null;
		const originalAttachmentId = storeSelect.getOriginalAttachmentId?.() || null;

		// Generate mode = opened without an existing image
		const isGenerateMode = originalAttachmentId === null;

		const imageStudio: ImageStudioData = {
			isOpen,
			id: attachmentId,
			metadata: {},
		};

		// Only include style for generate mode
		if ( selectedStyle && isGenerateMode ) {
			imageStudio.style = selectedStyle;
		}

		// Try to get attachment metadata from core store
		const coreSelect = select( 'core' ) as any;
		const attachment = attachmentId
			? coreSelect.getEntityRecord?.( 'postType', 'attachment', attachmentId )
			: null;

		if ( attachment ) {
			imageStudio.metadata = {
				id: attachment.id,
				title: attachment.title?.rendered || attachment.title,
				alt: attachment.alt_text,
				width: attachment.media_details?.width,
				height: attachment.media_details?.height,
				description: attachment.description?.rendered || attachment.description,
			};
		}

		return imageStudio;
	} catch ( error ) {
		window.console?.warn?.( '[Image Studio] Error detecting image entity:', error );
		return null;
	}
}

export function getClientContext(): ImageStudioClientContext {
	const imageStudio = detectImageEntity();

	const context: ImageStudioClientContext = {
		url: window.location.href,
		pathname: window.location.pathname,
		search: window.location.search,
		environment: 'wp-admin',
	};

	if ( imageStudio ) {
		context.imageStudio = imageStudio;
	}

	window.console?.log?.( '[Image Studio] Client context:', context );

	return context;
}

export const contextProvider = {
	getClientContext,
};
