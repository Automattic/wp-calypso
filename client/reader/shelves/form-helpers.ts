import { MAX_SHELF_NAME_LENGTH } from '@automattic/api-core';
import { useTranslate } from 'i18n-calypso';

type TranslateFn = ReturnType< typeof useTranslate >;

/**
 * Validate a shelf name for the create and edit forms. Returns user-facing copy
 * for the first failing rule, or `null` when the name is valid. Editors pass an
 * `existingNames` list with the current shelf's own name removed, so an
 * unchanged name never trips the duplicate check.
 */
export function validateName(
	name: string,
	existingNames: string[],
	translate: TranslateFn
): string | null {
	const trimmed = name.trim();
	if ( ! trimmed ) {
		return translate( 'Name is required' ) as string;
	}
	if ( trimmed.length > MAX_SHELF_NAME_LENGTH ) {
		return translate( 'The name must be %d characters or fewer', {
			args: [ MAX_SHELF_NAME_LENGTH ],
		} ) as string;
	}
	if ( existingNames.some( ( existing ) => existing.toLowerCase() === trimmed.toLowerCase() ) ) {
		return translate( 'A shelf with this name already exists' ) as string;
	}
	return null;
}

/**
 * Map a failed create/update shelf request to user-facing copy. The wpcom
 * transports surface the WP REST error code on `.code` (proxy) or `.error`
 * (legacy xhr), so read both. Unknown codes fall back to the generic message.
 */
export function getShelfErrorMessage( error: unknown, translate: TranslateFn ): string {
	const generic = translate( 'Something went wrong. Please try again.' ) as string;
	if ( ! error || typeof error !== 'object' ) {
		return generic;
	}
	const record = error as { code?: unknown; error?: unknown };
	// wpcom surfaces the code on `.code` (proxy) or `.error` (legacy xhr); take
	// whichever is a string so the switch always compares `string | undefined`.
	const rawCode = typeof record.code === 'string' ? record.code : record.error;
	const code = typeof rawCode === 'string' ? rawCode : undefined;
	switch ( code ) {
		case 'reader_shelves_invalid_title':
			return translate( 'Please enter a name for your shelf.' ) as string;
		case 'reader_shelves_invalid_tag':
			return translate( 'One or more of those tags is not an existing Reader tag.' ) as string;
		// The server derives the slug from the title, so a name collision surfaces as a
		// duplicate-title 409 (`reader_shelves_duplicate_slug` is the older code name).
		// It's slug-level, so it's slightly broader than an exact-name match (e.g. "My
		// Shelf" and "My Shelf!" both reduce to `my-shelf`).
		case 'reader_shelves_duplicate_title':
		case 'reader_shelves_duplicate_slug':
			return translate( 'You already have a shelf with this name.' ) as string;
		case 'reader_shelves_no_changes':
			return translate( 'There are no changes to save.' ) as string;
		case 'rest_forbidden':
			return translate( 'You do not have permission to do that.' ) as string;
		default:
			return generic;
	}
}
