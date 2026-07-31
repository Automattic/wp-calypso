/**
 * Opens Image Studio from sidebar suggestions.
 *
 * Image Studio ships as its own bundle and registers an `image-studio` store on
 * wp.data. It is loaded independently of this sidebar via the
 * `agents_manager_agent_providers` PHP filter, so it may or may not be present
 * at runtime. Reaching it through a store lookup rather than importing
 * `@automattic/image-studio` keeps its UI out of this bundle and avoids a second
 * registration of its store.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';

const IMAGE_STUDIO_STORE = 'image-studio';

/** Mirrors ImageStudioEntryPoint.EditorSidebar, duplicated to avoid a package dependency. */
const EDITOR_SIDEBAR_ENTRY_POINT = 'editor_sidebar';

export type ImageStudioMode = 'edit' | 'generate';

/** The subset of the Image Studio image payload written back to the block. */
interface ImageStudioImage {
	id: number;
	url: string;
	alt: string;
}

interface ImageStudioActions {
	openImageStudio: (
		attachmentId: number | undefined,
		onClose: ( image: ImageStudioImage | null ) => void,
		entryPoint: string,
		blockType?: string | null
	) => void;
}

function getImageStudioActions(): ImageStudioActions | undefined {
	const actions = dispatch( IMAGE_STUDIO_STORE ) as Partial< ImageStudioActions > | undefined;

	return typeof actions?.openImageStudio === 'function'
		? ( actions as ImageStudioActions )
		: undefined;
}

export function isImageStudioAvailable(): boolean {
	return !! getImageStudioActions();
}

/**
 * Opens Image Studio for a block, writing the resulting image back on close.
 * @param block - The selected block.
 * @param mode  - Whether to edit the block's existing image or generate a new one.
 * @returns Whether Image Studio was opened.
 */
export function openImageStudioForBlock( block: any, mode: ImageStudioMode ): boolean {
	const imageStudioActions = getImageStudioActions();

	if ( ! imageStudioActions || ! block?.clientId ) {
		return false;
	}

	const { clientId } = block;
	const attachmentId = block.attributes?.id;

	const handleClose = ( image: ImageStudioImage | null ) => {
		// A null image means the user removed it.
		if ( image === null ) {
			dispatch( blockEditorStore ).updateBlockAttributes( clientId, {
				url: undefined,
				id: undefined,
				alt: '',
				title: '',
				caption: '',
			} );
			return;
		}

		if ( image?.id ) {
			dispatch( blockEditorStore ).updateBlockAttributes( clientId, {
				url: image.url,
				id: image.id,
				alt: image.alt,
			} );
		}
	};

	imageStudioActions.openImageStudio(
		mode === 'edit' ? attachmentId : undefined,
		handleClose,
		EDITOR_SIDEBAR_ENTRY_POINT,
		block.name
	);

	return true;
}
