import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';

/**
 * The `root`/`site` record, shared by the site title and site metadata writers.
 *
 * Both read the same record and write it the same way, so the store shapes and
 * the write live here rather than being restated per field.
 */

export type SiteRecord = Record< string, unknown >;

interface CoreSelect {
	// An unresolved record reads as `false`, not `undefined`.
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id?: string
	) => SiteRecord | false | undefined;
}

interface CoreDispatch {
	editEntityRecord: (
		kind: string,
		name: string,
		id: string | undefined,
		edits: SiteRecord,
		options: { undoIgnore: boolean }
	) => void;
}

const UNAVAILABLE = 'The site record is unavailable to edit.';

/** The edited site record, or `undefined` when it cannot be read. */
export function getSiteRecord(): SiteRecord | undefined {
	const site = ( select( coreStore ) as CoreSelect | undefined )?.getEditedEntityRecord(
		'root',
		'site'
	);

	return site || undefined;
}

/**
 * Writes fields on the site record as pending edits for the editor's Save,
 * out of its undo stack — `restore-checkpoint` is the undo the agent offers.
 */
export function editSiteFields( edits: SiteRecord ): void {
	const coreDispatch = dispatch( coreStore ) as CoreDispatch | undefined;

	// Checked against the record, not just the dispatch: a field written before
	// the record loads is one no checkpoint could have snapshotted, leaving a
	// change with no undo behind it.
	if ( ! coreDispatch || ! getSiteRecord() ) {
		throw new Error( UNAVAILABLE );
	}

	coreDispatch.editEntityRecord( 'root', 'site', undefined, edits, { undoIgnore: true } );
}

export { UNAVAILABLE as SITE_RECORD_UNAVAILABLE };
