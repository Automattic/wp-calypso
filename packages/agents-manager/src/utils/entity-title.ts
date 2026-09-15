import { decodeEntities } from '@wordpress/html-entities';

/** A label as compared: case and surrounding whitespace do not tell items apart. */
export const normalizeLabel = ( label: unknown ): string =>
	String( label ?? '' )
		.trim()
		.toLocaleLowerCase();

/**
 * A title field flattened to a plain string: core-data returns `raw` from an
 * edited record, `rendered` from a saved one, and a plain string from a write.
 *
 * `rendered` is HTML, so it is decoded — written back as-is it would store
 * `About &amp; More` literally, and show that in the menu.
 */
export function flattenTitle( title: unknown ): string {
	if ( typeof title === 'string' ) {
		return title;
	}

	const { raw, rendered } = ( title ?? {} ) as { raw?: unknown; rendered?: unknown };

	if ( typeof raw === 'string' ) {
		return raw;
	}

	return typeof rendered === 'string' ? decodeEntities( rendered ) : '';
}
