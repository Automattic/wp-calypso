import { editSiteFields, getSiteRecord } from './site-record';

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

/** Renames the site, pending the user's Save. */
export function setSiteTitle( title: string ): void {
	editSiteFields( { title } );
}
