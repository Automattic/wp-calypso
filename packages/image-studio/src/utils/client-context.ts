/**
 * Client Context for Image Studio
 *
 * Provides context about the current Image Studio state to the AI agent.
 * This mirrors the pattern used in big-sky-plugin for wp-orchestrator.
 */

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as imageStudioStore } from '../store';

const CORE_STORE = 'core';

/**
 * Client context type for Image Studio
 */
export interface ImageStudioClientContext {
	url: string;
	pathname: string;
	search: string;
	environment: 'wp-admin';
	imageStudio?: {
		isOpen: boolean;
		id: number | null;
		style?: string;
		metadata: {
			id?: number;
			title?: string;
			alt?: string;
			width?: number;
			height?: number;
			description?: string;
		};
	};
}

/**
 * Detect and extract image entity context when Image Studio is open
 *
 * Note: We intentionally do NOT send the URL in context to prevent agent retry loops.
 * The backend fetches the current URL from the clientId (attachmentId) via
 * resolve_image_studio_url(). This avoids the agent seeing URL changes mid-turn
 * and deciding to retry operations.
 *
 * @return Image entity context or null
 */
function detectImageEntity(): { imageStudio: Record< string, any > } | null {
	try {
		const imageStudioSelect = select( imageStudioStore ) as any;

		if ( ! imageStudioSelect ) {
			return null;
		}

		const attachmentId = imageStudioSelect.getImageStudioAttachmentId?.();
		const isOpen = imageStudioSelect.getIsImageStudioOpen?.() || false;
		const selectedStyle = imageStudioSelect.getSelectedStyle?.() || null;
		const originalAttachmentId = imageStudioSelect.getOriginalAttachmentId?.() || null;

		// Generate mode = opened without an existing image
		const isGenerateMode = originalAttachmentId === null;

		// Build style property only for generate mode
		const styleProperty = selectedStyle && isGenerateMode ? { style: selectedStyle } : {};

		// Try to get the attachment entity from core store for metadata
		const coreDataStore = select( CORE_STORE ) as any;
		const attachment = attachmentId
			? coreDataStore.getEntityRecord?.( 'postType', 'attachment', attachmentId )
			: null;

		if ( ! attachment ) {
			return {
				imageStudio: {
					isOpen,
					id: attachmentId,
					...styleProperty,
					metadata: {},
				},
			};
		}

		return {
			imageStudio: {
				isOpen,
				id: attachmentId,
				...styleProperty,
				metadata: {
					id: attachment.id,
					title: attachment.title?.rendered || attachment.title,
					alt: attachment.alt_text,
					width: attachment.media_details?.width,
					height: attachment.media_details?.height,
					description: attachment.description?.rendered || attachment.description,
				},
			},
		};
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( '[Image Studio] Error detecting image entity:', error );
		return null;
	}
}

/**
 * Get the complete client context for Image Studio
 *
 * This provides the AI agent with information about the current Image Studio state,
 * including the open/closed state, current attachment ID, and image metadata.
 *
 * @return Client context object
 */
export function getClientContext(): ImageStudioClientContext {
	const imageEntity = detectImageEntity();

	const context: ImageStudioClientContext = {
		url: window.location.href,
		pathname: window.location.pathname,
		search: window.location.search,
		environment: 'wp-admin',
		...( imageEntity || {} ),
	};

	// eslint-disable-next-line no-console
	console.log( '[Image Studio] Client context:', context );

	return context;
}

/**
 * Create a context provider for the agent config
 */
export const contextProvider = {
	getClientContext,
};
