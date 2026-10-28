import { serialize } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import {
	DOCUMENT_ROOT_CLIENT_ID,
	findPostContentClientId,
	getCurrentPost,
	getRootBlocks,
} from './editor-blocks';
import { isEditorPage } from './is-editor-page';
import { isSiteEditorContext } from './site-editor-context';
import type { EditorBlock } from './editor-blocks';
import type { Block } from '@wordpress/blocks';

/**
 * Live page markup for the page-design agent. Prefer `core/post-content`'s
 * body; only the ordinary page editor can use the document root, so template
 * chrome is never sent as page content.
 */
export function getPageContentMarkup(): string {
	// Empty rather than thrown: a context read must never fail the turn.
	try {
		const postContentClientId = findPostContentClientId();
		const body = postContentClientId
			? getRootBlocks( postContentClientId )
			: getPageEditorDocumentBlocks();

		return body.length ? serialize( body as Block[] ) : '';
	} catch {
		return '';
	}
}

function getPageEditorDocumentBlocks(): EditorBlock[] {
	if ( ! isEditorPage() || isSiteEditorContext() || getCurrentPost()?.type !== 'page' ) {
		return [];
	}

	const getRenderingMode: ( () => string ) | undefined = select( 'core/editor' )?.getRenderingMode;

	// Show Template keeps the post type as page while the root contains template blocks.
	if ( getRenderingMode?.() !== 'post-only' ) {
		return [];
	}

	return getRootBlocks( DOCUMENT_ROOT_CLIENT_ID );
}
