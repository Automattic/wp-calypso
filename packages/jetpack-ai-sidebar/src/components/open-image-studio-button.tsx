/**
 * OpenImageStudioButton — offers Image Studio for edits to the image itself.
 *
 * Rendered when the `jetpack-ai/open-image-studio` ability returns a
 * show-component envelope with `data.type` set to 'open-image-studio-button'.
 * The agent cannot edit image files, so it hands the user off to Image Studio
 * through this button. Image Studio writes the result back to the block on
 * close (see `openImageStudioForBlock`).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isImageStudioAvailable, openImageStudioForBlock } from '../utils/image-studio';
import { trackOpenImageStudioButtonClick } from '../utils/tracking';

type BlockEditorStore = {
	getBlock?: ( clientId: string ) => any;
};

interface OpenImageStudioButtonProps {
	clientId: string;
}

/** Image Studio edits an existing attachment, so the block must still be an image with one. */
function canEditBlockImage( block: any ): boolean {
	return block?.name === 'core/image' && !! block?.attributes?.id;
}

/**
 * Renders the "Edit image" button for the image block the agent was asked about.
 * @param props          Component props.
 * @param props.clientId The image block's clientId.
 * @returns The button (disabled when the block can no longer be edited), or null when Image Studio is not loaded.
 */
export default function OpenImageStudioButton( { clientId }: OpenImageStudioButtonProps ) {
	const block = useSelect(
		( select ) => {
			const store = select( 'core/block-editor' ) as BlockEditorStore | undefined;
			return store?.getBlock?.( clientId ) ?? null;
		},
		[ clientId ]
	);
	// Read at render time: the bundle cannot unload, but a button restored from
	// history may render on a page where Image Studio is not loaded. The stored
	// summary reads on its own, so render nothing rather than a dead button.
	if ( ! isImageStudioAvailable() ) {
		return null;
	}

	return (
		<Button
			variant="primary"
			disabled={ ! canEditBlockImage( block ) }
			onClick={ () => {
				if ( openImageStudioForBlock( block, 'edit' ) ) {
					trackOpenImageStudioButtonClick();
				}
			} }
		>
			{ __( 'Edit image', __i18n_text_domain__ ) }
		</Button>
	);
}
