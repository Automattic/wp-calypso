/**
 * Client Context for Image Studio
 *
 * Provides context about the current Image Studio state to the AI agent.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { select } from '@wordpress/data';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore } from '../stores/video-studio';
import type { BlockEditorSelectors, CoreDataSelectors, WPBlock } from '../types/wordpress.d';

const POST_TITLE_MAX_LENGTH = 200;

export interface ImageStudioMetadata {
	id?: number;
	url?: string;
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
	aspect_ratio?: string;
	metadata: ImageStudioMetadata;
	entryPoint: ImageStudioEntryPoint | null;
	blockType: string | null;
}

export interface VideoStudioData {
	isOpen: boolean;
	id: number | null;
	style?: string;
	title?: string;
	metadata: ImageStudioMetadata;
	entryPoint: ImageStudioEntryPoint | null;
	blockType: string | null;
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
	environment: 'wp-admin' | 'image-studio' | 'video-studio';
	imageStudio?: ImageStudioData;
	videoStudio?: VideoStudioData;
	currentPageContent?: PageContentBlock[];
	constructorArguments?: {
		skip_storage?: boolean;
	};
}

const TEMPLATE_PART_SLUGS = [ 'header', 'header-hero', 'footer' ];

/**
 * Extract rendered text from a WordPress entity field that may be
 * either a plain string or a `{ rendered: string }` object.
 */
function getRenderedText( field: string | { rendered: string } | undefined ): string | undefined {
	if ( ! field ) {
		return undefined;
	}
	if ( typeof field === 'string' ) {
		return field;
	}
	return field.rendered;
}

/**
 * Recursively process blocks to resolve template part inner blocks.
 * Template part blocks don't include their innerBlocks by default;
 * they must be fetched separately from the block editor store.
 */
function processTemplatePartBlocks(
	blocks: WPBlock[],
	getBlocks: ( clientId?: string ) => WPBlock[]
): WPBlock[] {
	return blocks.map( ( block: WPBlock ) => {
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
		// TODO: remove cast when @wordpress/block-editor exports store types
		const blockEditorSelect = select( blockEditorStore ) as unknown as BlockEditorSelectors;
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
			( b: WPBlock ) =>
				b.name !== 'core/template-part' ||
				! TEMPLATE_PART_SLUGS.includes( b.attributes?.slug as string )
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

interface DetectedEntity {
	imageStudio?: ImageStudioData;
	videoStudio?: VideoStudioData;
	isOpen: boolean;
	isVideo: boolean;
}

/**
 * Detect and extract studio entity context when Image Studio is open.
 *
 * When the entry point is the post-editor "Generate Feature Clip" panel, we emit a
 * `videoStudio` payload (with `style`); otherwise we emit `imageStudio`
 * (with `style` + `aspect_ratio`). The two are mutually exclusive.
 *
 * Note on URLs in this payload:
 *  - We do NOT add a top-level `url` field on the `imageStudio` / `videoStudio`
 *    entity. The backend resolves the attachment's canonical URL from the
 *    clientId (attachmentId) via `resolve_image_studio_url()` to avoid agent
 *    retry loops on stale/transient URLs.
 *  - `metadata.url` is populated from `attachment.source_url` strictly as
 *    descriptive context for the agent (e.g. for prompt grounding); it is not
 *    used by the backend to fetch the asset.
 *  - The top-level `url` / `pathname` / `search` fields emitted by
 *    `getClientContext()` describe the editor page location, not the
 *    attachment, and are unrelated to the retry-loop concern above.
 */
function detectImageEntity(): DetectedEntity | null {
	try {
		const storeSelect = select( imageStudioStore );
		if ( ! storeSelect ) {
			return null;
		}

		const imageAttachmentId = storeSelect.getImageStudioAttachmentId?.();
		const isOpen = storeSelect.getIsImageStudioOpen?.() || false;
		const imageSelectedStyle = storeSelect.getSelectedStyle?.() || null;
		const selectedAspectRatio = storeSelect.getSelectedAspectRatio?.() || null;

		// Entrypoint for image studio context
		const entryPoint = storeSelect.getEntryPoint?.() || null;

		const blockType = storeSelect.getBlockType?.() || null;

		const isVideo = entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip;

		// Video-mode style lives in the dedicated video-studio store.
		const videoStudioSelect = select( videoStudioStore );
		const videoSelectedStyle = videoStudioSelect?.getSelectedStyle?.() ?? null;

		// In video mode, the generated clip's attachment id is written to the
		// video-studio store by `update-canvas-video`; the image-studio store's
		// id stays null for the PostEditorFeatureClip entry point.
		const videoAttachmentId = videoStudioSelect?.getCurrentAttachmentId?.() ?? null;
		const attachmentId = isVideo ? videoAttachmentId : imageAttachmentId;

		// Try to get attachment metadata from core store
		// TODO: remove cast when @wordpress/core-data exports store types
		const coreSelect = select( 'core' ) as unknown as CoreDataSelectors;
		const attachment = attachmentId
			? coreSelect.getEntityRecord?.( 'postType', 'attachment', attachmentId )
			: null;

		const metadata: ImageStudioMetadata = attachment
			? {
					id: attachment.id,
					url: attachment.source_url,
					title: getRenderedText( attachment.title ),
					alt: attachment.alt_text,
					width: attachment.media_details?.width,
					height: attachment.media_details?.height,
					description: getRenderedText( attachment.description ),
			  }
			: {};

		if ( isVideo ) {
			const videoStudio: VideoStudioData = {
				isOpen,
				id: attachmentId,
				entryPoint,
				blockType,
				metadata,
			};

			if ( videoSelectedStyle && videoSelectedStyle !== 'none' ) {
				videoStudio.style = videoSelectedStyle;
			}

			// Pull the current post title fresh from core/editor so the wpcom side
			// can render text-overlay frames; the store may not be registered in
			// non-editor contexts (e.g. tests, uploads.php), so treat it as optional.
			const editorSelect = select( 'core/editor' ) as unknown as {
				getEditedPostAttribute?: ( name: string ) => unknown;
			};
			const postTitle =
				typeof editorSelect?.getEditedPostAttribute === 'function'
					? ( editorSelect.getEditedPostAttribute( 'title' ) as string | undefined )
					: undefined;
			const trimmedTitle = typeof postTitle === 'string' ? postTitle.trim() : '';

			if ( trimmedTitle ) {
				videoStudio.title = trimmedTitle.slice( 0, POST_TITLE_MAX_LENGTH );
			}

			return { videoStudio, isOpen, isVideo: true };
		}

		const imageStudio: ImageStudioData = {
			isOpen,
			id: attachmentId,
			entryPoint, // 'editor_block' | 'media_library' | etc.
			blockType, // 'core/image' | etc.
			metadata,
		};

		if ( imageSelectedStyle && imageSelectedStyle !== 'none' ) {
			imageStudio.style = imageSelectedStyle;
		}

		if ( selectedAspectRatio ) {
			imageStudio.aspect_ratio = selectedAspectRatio;
		}

		return { imageStudio, isOpen, isVideo: false };
	} catch ( error ) {
		window.console?.warn?.( '[Image Studio] Error detecting image entity:', error );
		return null;
	}
}

export function getClientContext(): ImageStudioClientContext {
	const detected = detectImageEntity();

	let environment: ImageStudioClientContext[ 'environment' ] = 'wp-admin';
	if ( detected?.isOpen ) {
		environment = detected.isVideo ? 'video-studio' : 'image-studio';
	}

	const context: ImageStudioClientContext = {
		url: window.location.href,
		pathname: window.location.pathname,
		search: window.location.search,
		environment,
	};

	if ( detected?.videoStudio ) {
		context.videoStudio = detected.videoStudio;
	} else if ( detected?.imageStudio ) {
		context.imageStudio = detected.imageStudio;
	}

	const currentPageContent = getCurrentPageContent();
	if ( currentPageContent ) {
		context.currentPageContent = currentPageContent;
	}

	return context;
}

export const contextProvider = {
	getClientContext,
};
