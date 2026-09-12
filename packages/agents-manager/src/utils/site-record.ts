import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';

/**
 * The `root`/`site` record, shared by the site title and site metadata writers.
 *
 * Both read the same record and write it the same way, so the store shapes and
 * the edit-then-save pair live here rather than being restated per field.
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
	__experimentalSaveSpecifiedEntityEdits: (
		kind: string,
		name: string,
		id: string | undefined,
		fields: string[],
		options: { throwOnError: boolean }
	) => Promise< unknown >;
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
 * Writes fields on the site record and saves them.
 *
 * Agent edits stay out of the editor's undo stack — `restore-checkpoint` is the
 * undo the agent offers. The save is scoped to the fields written, derived from
 * the edits themselves so the two cannot drift: a blanket save would publish
 * whatever else the user had left pending on the record. Save errors are
 * suppressed by default, which would report a write that never reached the
 * server as a success.
 */
export async function saveSiteFields( edits: SiteRecord ): Promise< void > {
	const coreDispatch = dispatch( coreStore ) as CoreDispatch | undefined;

	if ( ! coreDispatch ) {
		throw new Error( UNAVAILABLE );
	}

	const site = getSiteRecord();

	// Checked against the record, not just the dispatch: a field written before
	// the record loads is one no checkpoint could have snapshotted, leaving a
	// change with no undo behind it.
	if ( ! site ) {
		throw new Error( UNAVAILABLE );
	}

	const fields = Object.keys( edits );
	const previous = Object.fromEntries( fields.map( ( field ) => [ field, site[ field ] ] ) );

	coreDispatch.editEntityRecord( 'root', 'site', undefined, edits, { undoIgnore: true } );

	try {
		await coreDispatch.__experimentalSaveSpecifiedEntityEdits( 'root', 'site', undefined, fields, {
			throwOnError: true,
		} );
	} catch ( error ) {
		// The edit is already applied locally, and `undoIgnore` keeps it out of
		// the editor's stack, so a failed save would strand a value with no undo
		// of any kind — the checkpoint goes too, since the write threw.
		coreDispatch.editEntityRecord( 'root', 'site', undefined, previous, { undoIgnore: true } );

		throw error;
	}
}

export { UNAVAILABLE as SITE_RECORD_UNAVAILABLE };
