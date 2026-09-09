import { getSiteRecord, saveSiteFields, SITE_RECORD_UNAVAILABLE } from './site-record';

/**
 * The site's `title` setting. Kept apart from `site-metadata` because it is a
 * field of the site record itself, not part of the metadata JSON stored in it
 * — the same split `site-logo` follows.
 *
 * WordPress renders it into every `core/site-title` block, so a change here
 * shows up across the site without touching any block.
 */

/** The title the editor holds, or `undefined` where the record is unreadable. */
export function getSiteTitle(): string | undefined {
	const site = getSiteRecord();

	return site ? String( site.title ?? '' ) : undefined;
}

/**
 * Renames the site and saves it. Agent edits stay out of the editor's undo
 * stack — `restore-checkpoint` is the undo the agent offers.
 *
 * Saved for the same reason the metadata is: the title is mirrored into the
 * metadata, and persisting one without the other leaves the two disagreeing
 * after a reload. Only the title is saved, so unrelated pending site edits
 * stay pending.
 */
export async function setSiteTitle( title: string ): Promise< void > {
	// Checked against the record, not just the dispatch: a title written before
	// the record loads is a title the checkpoint could not snapshot, leaving a
	// change with no undo behind it.
	if ( getSiteTitle() === undefined ) {
		throw new Error( SITE_RECORD_UNAVAILABLE );
	}

	await saveSiteFields( { title } );
}
