import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { checkpointKeys, withCheckpoint, type CheckpointRecorder } from '../../utils/checkpoints';
import { flattenTitle } from '../../utils/entity-title';
import { isEditorPage } from '../../utils/is-editor-page';
import {
	addNavigationItem,
	removeNavigationItem,
	renameNavigationItem,
} from '../../utils/navigation-menu';
import { getPageTitle } from '../../utils/page-title';
import { logSiteMetadata, logSiteSession } from '../../utils/session-log';
import { setSiteMetadata } from '../../utils/site-metadata';
import { setSiteTitle } from '../../utils/site-title';
import { errorResult, successResult } from '../ability-result';
import { buildNavigationItems } from './navigation-items';
import type { AbilityResult } from '../types';

const EDIT_ENTITY_RECORD_TOOL_ID = 'big_sky__edit_entity_record';

const SITE_TYPE = 'root';
const SITE_NAME = 'site';

const PAGE = 'page';
const NAVIGATION = 'wp_navigation';

interface EntityRef {
	entityType?: string;
	entityName?: string;
	recordId?: number | string;
	record?: Record< string, unknown >;
	options?: Record< string, unknown >;
}

export interface EditEntityRecordInput {
	addEntities?: EntityRef[];
	editEntities?: EntityRef[];
	deleteEntities?: EntityRef[];
	confirmationMessage?: string | null;
	summary?: string;
	toolCallId?: string;
}

/** What applied, so a partial failure still reports the work that landed. */
type AppliedChanges = {
	created: { entityName?: string; recordId?: number | string; title?: string }[];
	updated: { entityName?: string; recordId?: number | string }[];
	deleted: { entityName?: string; recordId?: number | string }[];
};

const hasChanges = ( { created, updated, deleted }: AppliedChanges ): boolean =>
	created.length > 0 || updated.length > 0 || deleted.length > 0;

interface CoreDispatch {
	saveEntityRecord: (
		kind: string,
		name: string,
		record: Record< string, unknown >,
		options?: Record< string, unknown >
	) => Promise< { id?: number | string; title?: unknown; link?: string } | null >;
	editEntityRecord: (
		kind: string,
		name: string,
		id: number | string,
		record: Record< string, unknown >,
		options?: Record< string, unknown >
	) => Promise< unknown >;
	deleteEntityRecord: (
		kind: string,
		name: string,
		id: number | string,
		options?: Record< string, unknown >
	) => Promise< unknown >;
}

const coreDispatch = () => dispatch( coreStore ) as unknown as CoreDispatch;

/**
 * The domains an edit touches, so a restore puts back only what changed.
 *
 * Edits only. A restore rewrites records that already existed — it cannot
 * delete a created one or bring back a deleted one — so a creation or deletion
 * that claimed a domain would offer the user an undo that does nothing, the
 * same trap `withCheckpoint()` guards against for a write with no keys at all.
 *
 * A page edit also claims the navigation domain: renaming a page renames the
 * menu item that follows it.
 */
export function getCheckpointKeys( { editEntities }: EditEntityRecordInput ): string[] {
	const keys = new Set< string >();

	for ( const entity of editEntities ?? [] ) {
		// Title only. A restore rewrites a page's title and the menu item that
		// follows it — never its content, excerpt or status — so a page edit
		// that touches none of the title claims nothing.
		if ( entity?.entityName === PAGE && entity.record?.title !== undefined ) {
			keys.add( checkpointKeys.PAGE );
			keys.add( checkpointKeys.NAVIGATION );
		}

		if ( entity?.entityName === NAVIGATION ) {
			keys.add( checkpointKeys.NAVIGATION );
		}

		// Matched the same way the write routes: a site edit always touches the
		// metadata, and one carrying a title touches the title too.
		if ( entity?.entityType === SITE_TYPE && entity?.entityName === SITE_NAME ) {
			keys.add( checkpointKeys.SITE_METADATA );

			if ( entity.record?.title ) {
				keys.add( checkpointKeys.SITE_TITLE );
			}
		}
	}

	return [ ...keys ];
}

async function applyCreates( entities: EntityRef[], applied: AppliedChanges ): Promise< void > {
	for ( const { entityType, entityName, record, options } of entities ) {
		if ( ! entityType || ! entityName || ! record ) {
			continue;
		}

		const created = await coreDispatch().saveEntityRecord(
			entityType,
			entityName,
			record,
			options
		);

		if ( ! created?.id ) {
			continue;
		}

		const title = flattenTitle( created.title );

		applied.created.push( { entityName, recordId: created.id, title } );

		if ( entityName === PAGE ) {
			await addNavigationItem( { label: title, id: created.id, url: created.link } );
		}
	}
}

/** Writes the site metadata and records the new value in the session log. */
async function editSiteMetadata( changes: Record< string, unknown > ): Promise< void > {
	const merged = await setSiteMetadata( changes );

	await logSiteMetadata( merged );

	if ( typeof changes.siteTitle === 'string' ) {
		await logSiteSession( changes.siteTitle );
	}
}

async function applyEdits(
	entities: EntityRef[],
	applied: AppliedChanges,
	recorder: CheckpointRecorder
): Promise< void > {
	for ( const { entityType, entityName, recordId, record, options } of entities ) {
		if ( ! entityType || ! entityName || ! record || recordId === undefined ) {
			continue;
		}

		// The site record is addressed by a sentinel `recordId` rather than a real
		// id, and the agent does not reliably send the one the instructions name.
		// The fields it carries are the dependable discriminator, and routing on
		// them matters: falling through to the generic branch below would edit
		// the site record without ever saving it.
		if ( entityType === SITE_TYPE && entityName === SITE_NAME ) {
			const title = flattenTitle( record.title );

			if ( title ) {
				await setSiteTitle( title );
				await editSiteMetadata( { siteTitle: title } );
			} else {
				await editSiteMetadata( record );
			}

			applied.updated.push( { entityName, recordId } );
			continue;
		}

		// Renames are recorded before the write, so a restore knows the title
		// to put back on both the page and the menu item that follows it.
		const previousTitle = entityName === PAGE ? await getPageTitle( recordId ) : '';
		const nextTitle = flattenTitle( record.title );
		const isRename = entityName === PAGE && !! nextTitle && nextTitle !== previousTitle;

		if ( isRename ) {
			recorder.capturePageRename( { pageId: recordId, from: previousTitle, to: nextTitle } );
		}

		let recordToWrite = record;

		if ( entityName === NAVIGATION ) {
			// Built before the snapshot: a refused rebuild must not leave a
			// restore point for an edit that never happened.
			recordToWrite = await buildNavigationItems( recordId, record );
			await recorder.captureMenu( recordId );
		}

		await coreDispatch().editEntityRecord(
			entityType,
			entityName,
			recordId,
			recordToWrite,
			options
		);

		applied.updated.push( { entityName, recordId } );

		if ( isRename ) {
			await renameNavigationItem( recordId, nextTitle, previousTitle );
		}
	}
}

async function applyDeletes( entities: EntityRef[], applied: AppliedChanges ): Promise< void > {
	for ( const { entityType, entityName, recordId, options } of entities ) {
		if ( ! entityType || ! entityName || recordId === undefined ) {
			continue;
		}

		if ( entityName === PAGE ) {
			await removeNavigationItem( recordId );
		}

		// TODO (ability-migration): Leave the page being deleted, once
		// `editor-navigate` lands and can route to the home page. Deleting the
		// page currently open leaves the editor showing one that is gone.

		// Resolved first so the record is in the store: deleting one that was
		// never fetched leaves the editor holding a stale copy.
		await (
			resolveSelect( coreStore ) as unknown as {
				getEditedEntityRecord: (
					kind: string,
					name: string,
					id: number | string
				) => Promise< unknown >;
			}
		 ).getEditedEntityRecord( entityType, entityName, recordId );

		await coreDispatch().deleteEntityRecord( entityType, entityName, recordId, options );

		applied.deleted.push( { entityName, recordId } );
	}
}

/**
 * The `edit-entity-record` ability callback: creates, edits and deletes the
 * site's entity records, keeping the navigation menu in step with the pages
 * it points at.
 */
export async function editEntityRecordCallback(
	input: EditEntityRecordInput
): Promise< AbilityResult > {
	const failureMessage = __( 'I could not make that change.', __i18n_text_domain__ );

	// Every branch below writes editor state, so the guard travels with them.
	if ( ! isEditorPage() ) {
		return errorResult( 'The editor is not open, so there is nothing to change.', failureMessage );
	}

	const { addEntities = [], editEntities = [], deleteEntities = [] } = input;

	if (
		! Array.isArray( addEntities ) ||
		! Array.isArray( editEntities ) ||
		! Array.isArray( deleteEntities )
	) {
		return errorResult(
			'Invalid arguments. Provide arrays for addEntities, editEntities, and deleteEntities.',
			failureMessage
		);
	}

	// The backend asks the model for a `confirmationMessage` before anything
	// destructive. An ability cannot put a component on screen — only the
	// backend's `show_component` renders one — so this refuses and writes
	// nothing rather than answering on the user's behalf.
	//
	// This tool echoes, so the refusal reaches the model as a client-tool
	// failure and it runs again: the `error` tells it to ask first and re-call
	// without the field. Two attempts before the backend gives up, so the
	// message has to be directive rather than merely descriptive.
	//
	// TODO (ability-migration): Render Yes/No buttons once the backend can
	// emit a confirmation component for this tool.
	if ( typeof input.confirmationMessage === 'string' && input.confirmationMessage.trim() ) {
		return errorResult(
			`Nothing was changed yet. Ask the user to confirm: "${ input.confirmationMessage.trim() }" — then call this tool again with the same arguments and no confirmationMessage.`,
			input.confirmationMessage.trim()
		);
	}

	const summary =
		( typeof input.summary === 'string' && input.summary.trim() ) ||
		__( 'Updated the site.', __i18n_text_domain__ );

	// Held outside the write: creating a page and then failing a menu edit has
	// already created the page, and reporting a bare failure would have the
	// agent create it again.
	const applied: AppliedChanges = { created: [], updated: [], deleted: [] };

	// The write returns its failure rather than throwing it, so a batch that
	// partly applied keeps the checkpoint — the earlier writes are still in
	// place and it is the only way back past them. It throws only when nothing
	// landed, letting `withCheckpoint()` drop a checkpoint that would restore
	// nothing. The trailing `catch` takes that rethrow.
	const failure = await withCheckpoint(
		{
			toolId: EDIT_ENTITY_RECORD_TOOL_ID,
			toolCallId: input.toolCallId,
			keys: getCheckpointKeys( input ),
			summary,
		},
		async ( recorder ): Promise< Error | undefined > => {
			try {
				await applyCreates( addEntities, applied );
				await applyEdits( editEntities, applied, recorder );
				await applyDeletes( deleteEntities, applied );
			} catch ( error ) {
				if ( ! hasChanges( applied ) ) {
					throw error;
				}

				return error as Error;
			}
		}
	).catch( ( error ) => error as Error );

	if ( failure ) {
		// A partial failure has to say so. The model gets two attempts, and one
		// told only that the call failed would repeat the writes that already
		// landed and duplicate them.
		if ( hasChanges( applied ) ) {
			return errorResult(
				`Partly applied, then failed with: ${ failure.message }. The changes listed in details already landed — do not repeat them.`,
				__( 'Some of those changes were applied, but the rest failed.', __i18n_text_domain__ ),
				applied
			);
		}

		return errorResult(
			`Failed to change the site. Error: ${ failure.message }`,
			failureMessage,
			applied
		);
	}

	return successResult( summary, applied );
}
