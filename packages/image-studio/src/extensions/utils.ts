import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';
import { transformAttachment } from '@wordpress/media-utils';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { type ImageData } from '../utils/get-image-data';

interface HandleImageSelectionOptions {
	image: ImageData;
	onSelect: ( image: any ) => void;
	multiple: boolean;
}

interface BlockContext {
	name: string;
	clientId?: string;
	attributes?: Record< string, any >;
	innerBlocks?: BlockContext[];
}

/**
 * Handles image selection by fetching the full attachment record,
 * transforming it to block editor format, and calling onSelect.
 * @param options          - The image selection options
 * @param options.image    - The image data from Image Studio
 * @param options.onSelect - Callback to execute with the transformed attachment
 * @param options.multiple - Whether multiple images are expected
 */
export function handleImageSelection( {
	image,
	onSelect,
	multiple,
}: HandleImageSelectionOptions ): void {
	if ( ! image?.id ) {
		// TODO: Show an error message to the user.
		window.console?.error?.( '[Image Studio] Image data is missing an ID.' );
		return;
	}

	// Fetch the full attachment record. ImageData lacks some fields like 'link' and 'sizes' that the image block uses.
	const attachment = select( coreStore ).getEntityRecord( 'postType', 'attachment', image.id ) as
		| Record< string, any >
		| undefined;

	// Transform the attachment from the REST API format to block editor format.
	// Maps REST API fields (alt_text, source_url, caption.raw, title.raw) to block editor fields (alt, caption, title, url).
	if ( attachment ) {
		const transformedAttachment = transformAttachment( attachment as any );

		onSelect( multiple ? [ transformedAttachment ] : transformedAttachment );
	}
}

/**
 * Opens Image Studio for a block and handles updating block attributes on close.
 * @param imageBlock - The image block (or block containing an image) with clientId and attributes
 * @param mode
 * @param entryPoint - The entry point for tracking
 * @returns True if Image Studio was opened, false otherwise
 */
export function openImageStudioForBlock(
	imageBlock: BlockContext,
	mode: ImageStudioMode = ImageStudioMode.Edit,
	entryPoint: ImageStudioEntryPoint = ImageStudioEntryPoint.EditorBlock
): boolean {
	if ( ! imageBlock?.clientId ) {
		return false;
	}

	const { clientId } = imageBlock;
	const attachmentId = imageBlock.attributes?.id;

	const handleClose = ( image: ImageData ) => {
		if ( image?.id ) {
			( dispatch( blockEditorStore ) as any ).updateBlockAttributes( clientId, {
				url: image.url,
				id: image.id,
				alt: image.alt,
			} );
		}
	};

	dispatch( imageStudioStore ).openImageStudio(
		mode === ImageStudioMode.Edit ? attachmentId : undefined,
		handleClose,
		entryPoint
	);

	return true;
}
