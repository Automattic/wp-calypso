export interface SelectedTextContext {
	text: string;
	attributeKey: string;
	start: number;
	end: number;
}

interface SelectionPoint {
	clientId?: string;
	attributeKey?: string;
	offset?: number;
}

interface BlockEditorSelect {
	getSelectionStart?: () => SelectionPoint | undefined;
	getSelectionEnd?: () => SelectionPoint | undefined;
	getBlockAttributes?: ( clientId: string ) => Record< string, unknown > | null;
}

// Rich text's stand-ins for inline objects and padding: they take up an index,
// but are not text the user selected.
const RESERVED_CHARACTERS = /[\ufffc\ufeff]/gu;

/**
 * The plain text the selection offsets index: a rich-text value's `text`, or
 * an HTML string without its markup.
 */
export function getAttributePlainText( value: unknown ): string | null {
	if ( value && typeof value === 'object' ) {
		const text = ( value as { text?: unknown } ).text;
		return typeof text === 'string' ? text : null;
	}

	if ( typeof value === 'string' ) {
		// As rich text has it: `<br>` is a newline.
		const html = value.replace( /<br\s*\/?>/gi, '\n' );
		const doc = new window.DOMParser().parseFromString( html, 'text/html' );
		return doc.body.textContent || '';
	}

	return null;
}

/**
 * The text the user selected inside one attribute of one block, or `null`.
 */
export function getSelectedTextContext(
	// Accepts both the registry `select` and the one given to `useSelect`.
	select: ( storeName: string ) => unknown
): SelectedTextContext | null {
	// Resolved by name to keep `@wordpress/block-editor` out of this module.
	const { getSelectionStart, getSelectionEnd, getBlockAttributes } =
		( select( 'core/block-editor' ) as BlockEditorSelect | undefined ) ?? {};

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
	// Stripped after slicing, so `start` and `end` stay the editor's offsets.
	const text = plainText.slice( start, end ).replace( RESERVED_CHARACTERS, '' );

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
