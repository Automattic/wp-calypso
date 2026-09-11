import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { bindToEditorPath } from '../../utils/canvas-guard';
import { checkpointKeys, withCheckpoint, type CheckpointRecorder } from '../../utils/checkpoints';
import { getEditorHistory } from '../../utils/editor-history';
import { flattenTitle } from '../../utils/entity-title';
import { isEditorPage } from '../../utils/is-editor-page';
import { isRecord } from '../../utils/is-record';
import {
	addNavigationItem,
	getMenuIdsToRelabel,
	MENU_FIELDS,
	removeNavigationItem,
	renameNavigationItem,
	type MenuId,
} from '../../utils/navigation-menu';
import { getPageTitle, getPageUrl, getSavedPageTitle, setPageTitle } from '../../utils/page-title';
import { logSiteMetadata, logSiteSession } from '../../utils/session-log';
import { setSiteMetadata } from '../../utils/site-metadata';
import { getSiteRecord } from '../../utils/site-record';
import { setSiteTitle } from '../../utils/site-title';
import { errorResult, successResult } from '../ability-result';
import { navigateEditorWithoutSaving, PAGES_LIST_PATH } from '../editor-navigate/callback';
import { buildNavigationItems, checkMenuRecord } from './navigation-items';
import type { AbilityResult } from '../types';

const EDIT_ENTITY_RECORD_TOOL_ID = 'big_sky__edit_entity_record';

const SITE_TYPE = 'root';
const SITE_NAME = 'site';

const POST_TYPE = 'postType';
const PAGE = 'page';
const NAVIGATION = 'wp_navigation';

// What each operation's schema allows — deletes take the same names as creates.
// Checked in `checkEntities()`, since deleting a `wp_navigation` record would
// take a whole menu with it.
const EDITABLE_NAMES = [ 'post', PAGE, 'product', NAVIGATION ];
const ADDABLE_NAMES = [ 'post', PAGE ];

// The kind and the name are independent enums, so pairs like `root/page` pass
// the schema. Routing partly on the name would then rename the real page while
// the rest of the record addressed nothing.
const isPostType = ( names: string[], entityType?: string, entityName?: string ) =>
	entityType === POST_TYPE && names.includes( entityName ?? '' );

const isSite = ( entityType?: string, entityName?: string ) =>
	entityType === SITE_TYPE && entityName === SITE_NAME;

// Derived from the lists, so a refusal cannot name a stale set.
const postTypeHelp = ( names: string[] ) => `${ POST_TYPE } with ${ names.join( ', ' ) }`;

// What makes a `wp_navigation` edit a menu edit. Only the item fields are
// checkpointed; a title- or status-only edit changes nothing the snapshot
// covers, so it claims no navigation domain and keeps the editor's undo.
const MENU_EDIT_FIELDS = [ 'navigationItems', ...MENU_FIELDS ];

const editsMenu = ( record?: Record< string, unknown > ) =>
	!! record && MENU_EDIT_FIELDS.some( ( field ) => field in record );

const pickFields = ( record: Record< string, unknown >, fields: string[], wanted: boolean ) =>
	Object.fromEntries(
		Object.entries( record ).filter( ( [ key ] ) => fields.includes( key ) === wanted )
	);

/** An entry as the agent sends it; `checkEntities()` turns it into an `Entity`. */
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

type Operation = 'create' | 'edit' | 'delete';

// The fields each operation cannot do without; `options` is optional everywhere.
const REQUIRED_FIELDS = {
	create: [ 'record' ],
	edit: [ 'recordId', 'record' ],
	delete: [ 'recordId' ],
} as const;

// A create's record is closed by the schema; an edit's is open to core-data.
const CREATE_RECORD_FIELDS = [ 'title', 'excerpt', 'content', 'status' ];

const FIELD_CHECKS: Record< keyof EntityRef, ( value: unknown ) => boolean > = {
	entityType: ( value ) => typeof value === 'string' && value !== '',
	entityName: ( value ) => typeof value === 'string' && value !== '',
	recordId: ( value ) => typeof value === 'number' || typeof value === 'string',
	record: isRecord,
	options: isRecord,
};

// The record fields the schema types, checked at runtime because a raw call
// can send anything: a wrong-typed title would clear one (null clears it on
// purpose), and a wrong-typed metadata field would persist as sent. Fields the
// schema leaves open reach core-data as sent.
const isText = ( value: unknown ) => value == null || typeof value === 'string';

const RECORD_FIELD_CHECKS: Record< string, ( value: unknown ) => boolean > = {
	title: ( value ) =>
		isText( value ) ||
		( isRecord( value ) &&
			( typeof value.raw === 'string' || typeof value.rendered === 'string' ) ),
	content: isText,
	excerpt: isText,
	status: isText,
	personality: isText,
	siteLocation: ( value ) =>
		value == null ||
		( isRecord( value ) &&
			isText( value.name ) &&
			( value.coordinates === undefined ||
				( Array.isArray( value.coordinates ) &&
					value.coordinates.every( ( c ) => typeof c === 'number' || typeof c === 'string' ) ) ) ),
};

/** An entry checked for its operation, so the writes can rely on its fields. */
type Entity< O extends Operation > = EntityRef &
	Required<
		Pick< EntityRef, 'entityType' | 'entityName' | ( typeof REQUIRED_FIELDS )[ O ][ number ] >
	>;

/**
 * Every entry, checked field by field before anything reads it.
 *
 * The callback runs on raw arguments, so this is where a wrong type is caught:
 * an array `record` would spread into numeric metadata keys, and a string one
 * would throw inside the checkpoint-key lookup before the structured error
 * path. Refused rather than skipped — a dropped entry would write nothing and
 * still read as applied.
 */
function checkEntities< O extends Operation >( entities: unknown[], operation: O ): Entity< O >[] {
	const required: string[] = [ 'entityType', 'entityName', ...REQUIRED_FIELDS[ operation ] ];

	return entities.map( ( entity ) => {
		const fields = isRecord( entity ) ? entity : {};
		const unknownField = Object.keys( fields ).find( ( field ) => ! ( field in FIELD_CHECKS ) );
		const valid = ( Object.keys( FIELD_CHECKS ) as ( keyof EntityRef )[] ).every( ( field ) =>
			fields[ field ] === undefined
				? ! required.includes( field )
				: FIELD_CHECKS[ field ]( fields[ field ] )
		);

		// A misspelt field is refused like a wrong-typed one: dropped, an
		// `option` meant as `options` would run the write without it.
		if ( unknownField || ! valid ) {
			throw new Error(
				`Cannot ${ operation }: ${ unknownField ? `unknown field ${ unknownField }; ` : '' }each ` +
					`entry needs ${ required.join( ', ' ) } — entityType and entityName as strings, ` +
					'recordId as a number or string, record and options as objects, and nothing else.'
			);
		}

		const checked = fields as Entity< O >;
		const { entityType, entityName, record } = checked;

		if ( operation === 'edit' ) {
			if (
				! isSite( entityType, entityName ) &&
				! isPostType( EDITABLE_NAMES, entityType, entityName )
			) {
				throw new Error(
					`Unsupported entity: ${ entityType }/${ entityName }. Use ${ SITE_TYPE }/${ SITE_NAME }, or ${ postTypeHelp(
						EDITABLE_NAMES
					) }.`
				);
			}
		} else if ( ! isPostType( ADDABLE_NAMES, entityType, entityName ) ) {
			throw new Error(
				`Cannot ${ operation } ${ entityType }/${ entityName }. Use ${ postTypeHelp(
					ADDABLE_NAMES
				) }.`
			);
		}

		const wrongField = Object.keys( RECORD_FIELD_CHECKS ).find(
			( field ) => record && field in record && ! RECORD_FIELD_CHECKS[ field ]( record[ field ] )
		);

		if ( wrongField ) {
			throw new Error(
				`Cannot ${ operation }: ${ wrongField } has the wrong type — title, content, excerpt, ` +
					'status and personality are strings (title may also be an object with a raw or ' +
					'rendered string), siteLocation is an object with a string name and an array of ' +
					'coordinates.'
			);
		}
		const unknownRecordField =
			operation === 'create' &&
			Object.keys( record ?? {} ).find( ( field ) => ! CREATE_RECORD_FIELDS.includes( field ) );

		if ( unknownRecordField ) {
			throw new Error(
				`Cannot create: unknown field ${ unknownRecordField } in record. A new ${ entityName } ` +
					`takes ${ CREATE_RECORD_FIELDS.join( ', ' ) } only.`
			);
		}

		if ( entityName === NAVIGATION && record ) {
			checkMenuRecord( record );
		}

		return checked;
	} );
}

type Batch = {
	creates: Entity< 'create' >[];
	edits: Entity< 'edit' >[];
	deletes: Entity< 'delete' >[];
};

// The schema's fields, plus what agenttic-client adds to every callback's input.
const BATCH_FIELDS = [
	'addEntities',
	'editEntities',
	'deleteEntities',
	'confirmationMessage',
	'summary',
	'followUpTasks',
	'messageId',
	'toolCallId',
	'toolId',
];

/**
 * The whole batch checked before the confirmation refusal, the checkpoint keys
 * and any write, so a malformed batch is refused whole rather than partly
 * applied. A field the schema does not name is refused too: a misspelt
 * `deleteEntities` would otherwise be dropped and the rest reported as done.
 */
function checkBatch( input: unknown ): Batch | Error {
	if ( ! isRecord( input ) ) {
		return new Error(
			'Invalid arguments. Provide an object with addEntities, editEntities or deleteEntities.'
		);
	}

	const unknownFields = Object.keys( input ).filter( ( key ) => ! BATCH_FIELDS.includes( key ) );

	if ( unknownFields.length ) {
		return new Error(
			`Invalid arguments. Unknown field: ${ unknownFields.join( ', ' ) }. Use addEntities, ` +
				'editEntities, deleteEntities and confirmationMessage only.'
		);
	}

	const {
		addEntities = [],
		editEntities = [],
		deleteEntities = [],
		confirmationMessage,
	} = input as EditEntityRecordInput;

	if ( confirmationMessage != null && typeof confirmationMessage !== 'string' ) {
		return new Error( 'Invalid arguments. confirmationMessage must be a string when present.' );
	}

	if (
		! Array.isArray( addEntities ) ||
		! Array.isArray( editEntities ) ||
		! Array.isArray( deleteEntities )
	) {
		return new Error(
			'Invalid arguments. Provide arrays for addEntities, editEntities, and deleteEntities.'
		);
	}

	if ( ! addEntities.length && ! editEntities.length && ! deleteEntities.length ) {
		return new Error(
			'Nothing to do. Provide at least one entry in addEntities, editEntities or deleteEntities.'
		);
	}

	try {
		return {
			creates: checkEntities( addEntities, 'create' ),
			edits: checkEntities( editEntities, 'edit' ),
			deletes: checkEntities( deleteEntities, 'delete' ),
		};
	} catch ( error ) {
		return error as Error;
	}
}

/**
 * What applied, so a partial failure still reports the work that landed.
 *
 * A type alias rather than an interface: this is passed as the result's
 * `details`, and only an alias carries the implicit index signature that
 * `Record< string, unknown >` needs.
 */
type AppliedChanges = {
	created: { entityName?: string; recordId?: number | string; title?: string }[];
	updated: { entityName?: string; recordId?: number | string; fields: string[] }[];
	deleted: { entityName?: string; recordId?: number | string }[];
};

const hasChanges = ( { created, updated, deleted }: AppliedChanges ): boolean =>
	created.length > 0 || updated.length > 0 || deleted.length > 0;

/**
 * Core-data's own signatures, spelled out for two traps: errors are suppressed
 * unless the options carry `throwOnError`, and those options come *fifth* on a
 * delete — the fourth argument is the request's query args.
 */
interface CoreDispatch {
	saveEntityRecord: (
		kind: string,
		name: string,
		record: Record< string, unknown >,
		options?: Record< string, unknown >
	) => Promise< {
		id?: number | string;
		title?: unknown;
		link?: string;
		parent?: number;
	} | null >;
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
		query: Record< string, unknown > | undefined,
		options?: Record< string, unknown >
	) => Promise< unknown >;
}

interface CoreResolve {
	getEditedEntityRecord: ( kind: string, name: string, id: number | string ) => Promise< unknown >;
}

const coreDispatch = () => dispatch( coreStore ) as unknown as CoreDispatch;

const coreResolve = () => resolveSelect( coreStore ) as unknown as CoreResolve;

/**
 * The titles a menu label may follow: the one on screen, and the one saved
 * when the page's own edit is still pending.
 */
const pageLabels = async ( pageId: number | string, current: string ): Promise< string[] > => [
	...new Set( [ current, await getSavedPageTitle( pageId ) ] ),
];

/** Whether the editor has this record open — a post or page in the post editor, a page in the site editor. */
const isOpenInEditor = ( entityName: string, recordId: number | string ): boolean => {
	const editor = select( 'core/editor' ) as
		| {
				getCurrentPostType?: () => string | undefined;
				getCurrentPostId?: () => number | string | undefined;
		  }
		| undefined;

	return (
		editor?.getCurrentPostType?.() === entityName &&
		String( editor.getCurrentPostId?.() ) === String( recordId )
	);
};

/**
 * The domains an edit touches, so a restore puts back only what changed.
 *
 * Edits only: a restore cannot delete a created record or bring back a deleted
 * one, so claiming a domain for either would offer an undo that does nothing.
 *
 * A page edit also claims the navigation domain, since renaming a page renames
 * the menu item that follows it.
 */
export function getCheckpointKeys( edits: Entity< 'edit' >[] ): string[] {
	const keys = new Set< string >();

	for ( const { entityType, entityName, record } of edits ) {
		// Only the title is restorable on a page, never the content, excerpt or
		// status. Claimed on presence alone: a rename to the title the page
		// already has records nothing, and the claim is dropped afterwards.
		if ( entityName === PAGE && 'title' in record ) {
			keys.add( checkpointKeys.PAGE );
			keys.add( checkpointKeys.NAVIGATION );
		}

		if ( entityName === NAVIGATION && editsMenu( record ) ) {
			keys.add( checkpointKeys.NAVIGATION );
		}

		// Matched the same way the write routes: a site edit always touches the
		// metadata, and one carrying a title touches the title too.
		if ( isSite( entityType, entityName ) ) {
			keys.add( checkpointKeys.SITE_METADATA );

			if ( 'title' in record ) {
				keys.add( checkpointKeys.SITE_TITLE );
			}
		}
	}

	return [ ...keys ];
}

async function applyCreates(
	entities: Entity< 'create' >[],
	applied: AppliedChanges
): Promise< void > {
	for ( const { entityType, entityName, record, options } of entities ) {
		const created = await coreDispatch().saveEntityRecord( entityType, entityName, record, {
			...options,
			throwOnError: true,
		} );

		// Refused for the same reason as a malformed entry: without an id there is
		// nothing to report, and a silent skip would read as a success.
		if ( ! created?.id ) {
			throw new Error( `Created ${ entityType }/${ entityName }, but no id came back.` );
		}

		const title = flattenTitle( created.title );

		applied.created.push( { entityName, recordId: created.id, title } );

		if ( entityName === PAGE ) {
			await addNavigationItem( {
				label: title,
				id: created.id,
				url: created.link,
				parent: created.parent,
			} );
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

/**
 * Reports the entity as updated, once, however many of its writes land.
 *
 * Called the moment the first write persists rather than at the end: a later
 * failure keeps the checkpoint only if something is reported as applied, and
 * that checkpoint is the landed change's only undo.
 */
function reportUpdated( applied: AppliedChanges, { entityName, recordId }: Entity< 'edit' > ) {
	let entry: AppliedChanges[ 'updated' ][ number ] | undefined;

	return ( ...fields: string[] ) => {
		if ( ! entry ) {
			entry = { entityName, recordId, fields: [] };
			applied.updated.push( entry );
		}

		entry.fields.push( ...fields );
	};
}

/**
 * Writes the site's title and metadata.
 *
 * The site record is addressed by a sentinel `recordId` rather than a real id,
 * and the agent does not reliably send the one the instructions name, so the
 * fields it carries are the discriminator. Title and metadata travel together:
 * one call can carry both, and routing on the title alone dropped the rest.
 */
async function applySiteEdit(
	entity: Entity< 'edit' >,
	applied: AppliedChanges,
	recorder: CheckpointRecorder
): Promise< void > {
	const { record } = entity;
	const { title, ...metadata } = record;
	const updated = reportUpdated( applied, entity );

	if ( 'title' in record ) {
		const siteTitle = flattenTitle( title );

		await setSiteTitle( siteTitle );
		recorder.markWritten( checkpointKeys.SITE_TITLE );
		metadata.siteTitle = siteTitle;
		updated( 'title' );
	}

	await editSiteMetadata( metadata );
	recorder.markWritten( checkpointKeys.SITE_METADATA );
	updated( ...Object.keys( metadata ) );
}

/** Writes one page, post, product or menu record. */
async function applyRecordEdit(
	entity: Entity< 'edit' >,
	applied: AppliedChanges,
	recorder: CheckpointRecorder
): Promise< void > {
	const { entityType, entityName, recordId, record } = entity;
	const updated = reportUpdated( applied, entity );

	// Resolved first: `editEntityRecord()` reads the persisted record to tell a
	// real change from a no-op, and one that was never fetched throws there.
	if ( ! ( await coreResolve().getEditedEntityRecord( entityType, entityName, recordId ) ) ) {
		throw new Error(
			`Cannot edit ${ entityName } ${ recordId }: it could not be read and may have been deleted.`
		);
	}

	// Presence, not truthiness: a request carrying an empty title clears the page
	// name, which is as restorable as any rename.
	const renaming = entityName === PAGE && 'title' in record;
	const previousTitle = renaming ? await getPageTitle( recordId ) : '';
	const nextTitle = flattenTitle( record.title );
	const isRename = renaming && nextTitle !== previousTitle;

	// Read before the title changes: what the menu item followed until now.
	const previousLabels = isRename ? await pageLabels( recordId, previousTitle ) : [];
	const previousUrl = isRename ? await getPageUrl( recordId ) : undefined;

	// The title is checkpointed, so it goes through `setPageTitle` and stays out
	// of the editor's undo stack. The rest of the record is not, so the editor's
	// stack remains its only undo and it keeps it.
	let recordToWrite = isRename ? pickFields( record, [ 'title' ], false ) : record;
	let menuWrite: Record< string, unknown > | undefined;
	let capturedMenu = false;

	if ( entityName === NAVIGATION ) {
		// Built before the snapshot: a refused rebuild must not leave a restore
		// point for an edit that never happened.
		const rebuilt = await buildNavigationItems( recordId, record );
		const menuFields = pickFields( rebuilt, MENU_FIELDS, true );

		recordToWrite = pickFields( rebuilt, MENU_FIELDS, false );

		// Snapshot only where the menu itself changes: a title-only edit has
		// nothing the restore could put back.
		if ( Object.keys( menuFields ).length ) {
			menuWrite = menuFields;
			capturedMenu = await recorder.captureMenu( recordId );
		}
	}

	if ( isRename ) {
		await setPageTitle( recordId, nextTitle );

		// Recorded once the rename lands, not before: an edit that rejected would
		// otherwise leave a checkpoint offering to undo a rename that never
		// happened, and relabel a menu item to match.
		recorder.capturePageRename( { pageId: recordId, from: previousTitle, to: nextTitle } );
		updated( 'title' );
	}

	if ( menuWrite ) {
		try {
			// Checkpointed, so `restore-checkpoint` is its undo and the editor's
			// stack would be a second, competing one.
			await coreDispatch().editEntityRecord( entityType, entityName, recordId, menuWrite, {
				undoIgnore: true,
			} );
		} catch ( error ) {
			// Only the snapshot this attempt took. An earlier successful edit to
			// the same menu owns its own, and that one is still the way back.
			if ( capturedMenu ) {
				recorder.discardMenu( recordId );
			}

			throw error;
		}

		// Recorded here, not after the write below: this one has already changed
		// the menu with `undoIgnore`, so a later failure must not take its only
		// undo down with it.
		updated( 'navigationItems' );
	}

	// The agent's `options` stay out of edits: the only one core-data reads
	// here is `undoIgnore`, and whether a write keeps the editor's undo is
	// decided above, not by the request.
	if ( Object.keys( recordToWrite ).length ) {
		await coreDispatch().editEntityRecord( entityType, entityName, recordId, recordToWrite );
		updated( ...Object.keys( recordToWrite ) );
	}

	if ( isRename ) {
		// Snapshot the menus the rename will relabel: a restore puts each back as
		// it was rather than relabelling, so the item's label returns exactly.
		// Discarded together when the rename fails: it reads every menu before
		// writing any, and its writes are local dispatches that fail for every
		// menu or none, so a rename that fails changed nothing — and a snapshot
		// of an untouched menu would let an undo overwrite the user's later edits.
		const captured: MenuId[] = [];

		try {
			for ( const menuId of await getMenuIdsToRelabel( recordId, previousLabels, previousUrl ) ) {
				if ( await recorder.captureMenu( menuId ) ) {
					captured.push( menuId );
				}
			}

			await renameNavigationItem( recordId, nextTitle, previousLabels, previousUrl );
		} catch ( error ) {
			captured.forEach( ( menuId ) => recorder.discardMenu( menuId ) );

			throw error;
		}
	}
}

async function applyEdits(
	entities: Entity< 'edit' >[],
	applied: AppliedChanges,
	recorder: CheckpointRecorder
): Promise< void > {
	for ( const entity of entities ) {
		const { entityType, entityName, recordId, record } = entity;

		if ( ! Object.keys( record ).length ) {
			throw new Error( `Nothing to change on ${ entityName } ${ recordId }: the record is empty.` );
		}

		if ( isSite( entityType, entityName ) ) {
			await applySiteEdit( entity, applied, recorder );
		} else {
			await applyRecordEdit( entity, applied, recorder );
		}
	}
}

/**
 * Routes the editor off a record about to be deleted: to the front page, or the
 * pages list when the site shows posts there or the page is the front page.
 *
 * It navigates without saving, since pending edits are the user's to publish.
 * The post editor refuses: only the site editor's router can leave without a
 * full page load, which could cut the delete off. The canvas binding is handed
 * over first, or the move reads as the user leaving and aborts the request.
 */
async function leaveRecord( entityName: string, recordId: number | string ): Promise< void > {
	if ( ! getEditorHistory() ) {
		throw new Error(
			`Cannot delete ${ entityName } ${ recordId }: it is open in this editor, which cannot ` +
				'leave it first. Ask the user to open a different page, then call again.'
		);
	}

	// `page_on_front` lingers after a site switches to showing posts, so it
	// counts only while the site shows a page there.
	const site = getSiteRecord();
	const frontPageId = site?.show_on_front === 'page' ? Number( site.page_on_front ) : 0;
	const path =
		frontPageId && frontPageId !== Number( recordId ) ? `/page/${ frontPageId }` : PAGES_LIST_PATH;
	const rollbackBinding = bindToEditorPath( path );
	const { result } = await navigateEditorWithoutSaving( path );

	if ( ! result.success ) {
		// A navigation that fired but did not settle keeps its destination
		// binding, or the arrival would read as the user leaving.
		if ( ! result.details?.navigated ) {
			rollbackBinding();
		}

		throw new Error( `Could not leave the page before deleting it: ${ result.error }` );
	}
}

async function applyDeletes(
	entities: Entity< 'delete' >[],
	applied: AppliedChanges
): Promise< void > {
	for ( const { entityType, entityName, recordId, options } of entities ) {
		// Deleting the record on screen would leave the editor showing one that
		// no longer exists.
		if ( isOpenInEditor( entityName, recordId ) ) {
			await leaveRecord( entityName, recordId );
		}

		// Resolved first so the record is in the store: deleting one that was
		// never fetched leaves the editor holding a stale copy.
		await coreResolve().getEditedEntityRecord( entityType, entityName, recordId );

		// Read before the delete: a menu item carrying no page id is matched by
		// its url, and the page is the only place it comes from.
		const previousUrl = entityName === PAGE ? await getPageUrl( recordId ) : undefined;

		await coreDispatch().deleteEntityRecord( entityType, entityName, recordId, undefined, {
			...options,
			throwOnError: true,
		} );

		// Recorded before the menu write, which can still fail: the page is gone
		// either way, and a failure that did not report it would have the agent
		// try the deletion again.
		applied.deleted.push( { entityName, recordId } );

		// After the delete, never before: the menu write persists, so removing
		// the item first would strip it for good if the delete then failed.
		if ( entityName === PAGE ) {
			await removeNavigationItem( recordId, previousUrl );
		}
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

	const batch = checkBatch( input );

	if ( batch instanceof Error ) {
		return errorResult( batch.message, failureMessage );
	}

	// The backend asks the model for a `confirmationMessage` before anything
	// destructive. Confirmation is conversational: this writes nothing, the agent
	// asks, and the user answers in the chat, where Big Sky renders Yes/No
	// buttons from its own chat store. The refusal comes back as a client-tool
	// failure and the model runs again, so the `error` has to be directive — it
	// gets two attempts before the backend gives up.
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
			keys: getCheckpointKeys( batch.edits ),
			summary,
		},
		async ( recorder ): Promise< Error | undefined > => {
			try {
				// Deletes before edits: a menu edit then snapshots the menu as the
				// deletion left it, so undoing the edit cannot bring back a link
				// to a page that is gone.
				await applyCreates( batch.creates, applied );
				await applyDeletes( batch.deletes, applied );
				await applyEdits( batch.edits, applied, recorder );
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
				`Partly applied, then failed with: ${ failure.message }. The changes listed in details already landed — do not repeat them; on an updated record, only the fields listed did.`,
				__( 'Some of those changes were applied, but the rest failed.', __i18n_text_domain__ ),
				applied
			);
		}

		return errorResult( `Failed to change the site. Error: ${ failure.message }`, failureMessage );
	}

	return successResult( summary, applied );
}
