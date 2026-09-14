import { getSiteRecord, saveSiteFields } from './site-record';

/**
 * The site's `title` setting: a field of the site record itself, not part of
 * the metadata JSON stored in it, hence its own module like `site-logo`.
 * WordPress renders it into every `core/site-title` block.
 */

/** The title the editor holds, or `undefined` where the record is unreadable. */
export function getSiteTitle(): string | undefined {
	const site = getSiteRecord();

	return site ? String( site.title ?? '' ) : undefined;
}

/**
 * Renames the site and saves only the title, so unrelated pending site edits
 * stay pending. Saved, like the metadata the title is mirrored into: persisting
 * one without the other leaves the two disagreeing after a reload.
 */
export async function setSiteTitle( title: string ): Promise< void > {
	await saveSiteFields( { title } );
}
