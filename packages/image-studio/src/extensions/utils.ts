import { select } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { transformAttachment } from '@wordpress/media-utils';
import { type ImageData } from '../utils/get-image-data';

interface HandleImageSelectionOptions {
	image: ImageData;
	onSelect: ( image: any ) => void;
	multiple: boolean;
}

/**
 * Handles image selection by fetching the full attachment record,
 * transforming it to block editor format, and calling onSelect.
 *
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
		console.error( '[Image Studio] Image data is missing an ID.' );
		return;
	}

	// Fetch the full attachment record. ImageData lacks some fields like 'link' and 'sizes' that the image block uses.
	const attachment = select( coreStore ).getEntityRecord( 'postType', 'attachment', image.id );

	// Transform the attachment from the REST API format to block editor format.
	// Maps REST API fields (alt_text, source_url, caption.raw, title.raw) to block editor fields (alt, caption, title, url).
	if ( attachment ) {
		// Cast to any since getEntityRecord returns a broader type than transformAttachment expects
		const transformedAttachment = transformAttachment( attachment as any );

		onSelect( multiple ? [ transformedAttachment ] : transformedAttachment );
	}
}
