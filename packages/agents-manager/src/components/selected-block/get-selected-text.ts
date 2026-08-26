import { store as blockEditorStore } from '@wordpress/block-editor';

export interface SelectedTextContext {
	text: string;
	attributeKey: string;
	start: number;
	end: number;
}

/**
 * Get the plain text of a block attribute value.
 *
 * Rich-text attributes (RichTextData) expose a `text` property whose indices
 * match the selection offsets from the block-editor store. HTML string
 * attributes are converted to an equivalent plain-text shape.
 */
export function getAttributePlainText( value: unknown ): string | null {
	if ( value && typeof value === 'object' ) {
		const text = ( value as { text?: unknown } ).text;
		return typeof text === 'string' ? text : null;
	}

	if ( typeof value === 'string' ) {
		// Approximate the rich-text plain-text shape: <br> becomes a newline,
		// other markup is stripped.
		const html = value.replace( /<br\s*\/?>/gi, '\n' );
		const doc = new window.DOMParser().parseFromString( html, 'text/html' );
		return doc.body.textContent || '';
	}

	return null;
}

/**
 * Read the current inline text selection from the block editor.
 *
 * A selection is valid when the selection start and end are inside the same
 * block, point at the same text attribute, and have different offsets.
 *
 * Mirror of big-sky-plugin's `src/ai/utils/text-selection.ts` — keep in sync.
 */
export function getSelectedTextContext(
	// Accepts both the registry `select` and the one given to `useSelect`.
	select: ( store: unknown ) => unknown
): SelectedTextContext | null {
	const { getSelectionStart, getSelectionEnd, getBlockAttributes } = select(
		blockEditorStore
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) as any;

	const selectionStart = getSelectionStart?.();
	const selectionEnd = getSelectionEnd?.();

	if (
		! selectionStart?.clientId ||
		selectionStart.clientId !== selectionEnd?.clientId ||
		! selectionStart.attributeKey ||
		selectionStart.attributeKey !== selectionEnd.attributeKey ||
		typeof selectionStart.offset !== 'number' ||
		typeof selectionEnd.offset !== 'number' ||
		selectionStart.offset === selectionEnd.offset
	) {
		return null;
	}

	const attributes = getBlockAttributes?.( selectionStart.clientId );
	const plainText = getAttributePlainText( attributes?.[ selectionStart.attributeKey ] );

	if ( typeof plainText !== 'string' ) {
		return null;
	}

	const start = Math.min( selectionStart.offset, selectionEnd.offset );
	const end = Math.max( selectionStart.offset, selectionEnd.offset );
	const text = plainText.slice( start, end );

	if ( ! text ) {
		return null;
	}

	return {
		text,
		attributeKey: selectionStart.attributeKey,
		start,
		end,
	};
}
