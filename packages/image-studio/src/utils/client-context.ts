/**
 * Client Context for Image Studio
 *
 * Provides context about the current Image Studio state to the AI agent.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
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

export interface PageContentBlock {
	name: string;
	type?: 'header' | 'content' | 'footer';
	clientId: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: PageContentBlock[];
}

export interface ImageStudioClientContext extends Record< string, unknown > {
	url: string;
	pathname: string;
	search: string;
	environment: 'wp-admin';
	imageStudio?: ImageStudioData;
	currentPageContent?: PageContentBlock[];
}

const TEMPLATE_PART_SLUGS = [ 'header', 'header-hero', 'footer' ];

/**
 * Recursively process blocks to resolve template part inner blocks.
 * Template part blocks don't include their innerBlocks by default;
 * they must be fetched separately from the block editor store.
 */
function processTemplatePartBlocks(
	blocks: any[],
	getBlocks: ( clientId?: string ) => any[]
): any[] {
	return blocks.map( ( block: any ) => {
		const processed = { ...block };

		if ( block.name === 'core/template-part' || block.name === 'core/post-content' ) {
			processed.innerBlocks = getBlocks( block.clientId );
		}

		if ( processed.innerBlocks?.length ) {
			processed.innerBlocks = processTemplatePartBlocks( processed.innerBlocks, getBlocks );
		}

		return processed;
	} );
}

/**
 * Get the current page content from the block editor.
 * Returns an array of blocks structured with header/content/footer types,
 * matching the format expected by the backend page context processor.
 *
 * Uses raw WordPress client IDs (no compression).
 */
function getCurrentPageContent(): PageContentBlock[] | null {
	try {
		const blockEditorSelect = select( blockEditorStore ) as any;
		if ( ! blockEditorSelect ) {
			return null;
		}

		const { getBlocks, getBlocksByName, getBlock } = blockEditorSelect;

		// Bail early if not in a block editor context (e.g. uploads.php).
		// The store is registered globally but has no blocks outside the editor.
		const rootBlocks = getBlocks();
		if ( ! rootBlocks?.length ) {
			return null;
		}

		// Find header and footer template parts
		const templatePartBlockIds: string[] = getBlocksByName?.( 'core/template-part' ) || [];

		let headerBlockId = templatePartBlockIds.find(
			( blockId: string ) => getBlock( blockId )?.attributes?.slug === 'header-hero'
		);
		if ( ! headerBlockId ) {
			headerBlockId = templatePartBlockIds.find(
				( blockId: string ) => getBlock( blockId )?.attributes?.slug === 'header'
			);
		}
		const footerBlockId = templatePartBlockIds.find(
			( blockId: string ) => getBlock( blockId )?.attributes?.slug === 'footer'
		);

		// Filter content blocks (exclude known template parts)
		const contentBlocks = rootBlocks.filter(
			( b: any ) =>
				b.name !== 'core/template-part' || ! TEMPLATE_PART_SLUGS.includes( b.attributes?.slug )
		);

		// Get inner blocks of header and footer
		const headerBlocks = headerBlockId ? getBlocks( headerBlockId ) : [];
		const footerBlocks = footerBlockId ? getBlocks( footerBlockId ) : [];

		// Process all block collections to resolve template part inner blocks
		const processedHeaderBlocks = processTemplatePartBlocks( headerBlocks, getBlocks );
		const processedFooterBlocks = processTemplatePartBlocks( footerBlocks, getBlocks );
		const processedContentBlocks = processTemplatePartBlocks( contentBlocks, getBlocks );

		const allBlocks: PageContentBlock[] = [];

		// Add header
		if ( processedHeaderBlocks.length && headerBlockId ) {
			allBlocks.push( {
				name: 'core/template-part',
				type: 'header',
				clientId: headerBlockId,
				attributes: { ...getBlock( headerBlockId )?.attributes },
				innerBlocks: processedHeaderBlocks,
			} );
		}

		// Add content
		if ( processedContentBlocks.length ) {
			allBlocks.push( ...processedContentBlocks );
		}

		// Add footer
		if ( processedFooterBlocks.length && footerBlockId ) {
			allBlocks.push( {
				name: 'core/template-part',
				type: 'footer',
				clientId: footerBlockId,
				attributes: { ...getBlock( footerBlockId )?.attributes },
				innerBlocks: processedFooterBlocks,
			} );
		}

		return allBlocks.length ? allBlocks : null;
	} catch ( error ) {
		window.console?.warn?.( '[Image Studio] Error getting page content:', error );
		return null;
	}
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

	const currentPageContent = getCurrentPageContent();
	if ( currentPageContent ) {
		context.currentPageContent = currentPageContent;
	}

	window.console?.log?.( '[Image Studio] Client context:', context );

	return context;
}

export const contextProvider = {
	getClientContext,
};
