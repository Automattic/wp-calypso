import { editGlobalStyles, getEditedGlobalStyles, type GlobalStylesRecord } from './global-styles';
import {
	isSameMenuId,
	readMenuItems,
	writeMenuItems,
	type MenuId,
	type NavigationBlock,
} from './navigation-menu';
import { getPageTitle, setPageTitle } from './page-title';
import { getSiteLogo, setSiteLogo, type SiteLogo } from './site-logo';
import { getSiteMetadata, replaceSiteMetadata, type SiteMetadata } from './site-metadata';
import { getSiteTitle, setSiteTitle } from './site-title';
import { getToolCallIdFromConversationHistory } from './tool-call-history';

/**
 * AM-owned checkpoint store: in-memory, per page load, keyed by tool call id.
 *
 * Ported from Big Sky's `use-checkpoint` as plain functions, since AM abilities
 * execute as plain callbacks. The global-styles, site-logo, site-title, page,
 * navigation and site-metadata domains restore today. The block domain lands
 * with `apply-block-edits`; until then its checkpoints live in Big Sky's store
 * and restore through the `provider-checkpoints` bridge.
 *
 * Big Sky also re-applies the checkpoint's variation titles after a restore, to
 * sync its variation-selection store. AM has no such store, and the entity
 * snapshot alone restores the full visual state.
 */

// Big Sky's scoped checkpoint keys — they gate which domains a restore
// applies. The theme domain restores the full global-styles snapshot
// wholesale, matching Big Sky.
export const checkpointKeys = {
	COLOR: 'color',
	FONT: 'font',
	BUTTON: 'button',
	LOGO: 'logo',
	PAGE: 'page',
	NAVIGATION: 'navigation',
	SITE_METADATA: 'site_metadata',
	SITE_TITLE: 'site_title',
} as const;

export const THEME_CHECKPOINT_KEYS: string[] = [
	checkpointKeys.COLOR,
	checkpointKeys.FONT,
	checkpointKeys.BUTTON,
];

export const RESTORE_CHECKPOINT_TOOL_ID = 'big_sky__restore_checkpoint';

export interface CheckpointMetadata {
	toolId?: string;
	summary?: string;
	requestIntentType?: 'undo' | 'redo' | 'restore';
	createdByRequestIntentType?: string;
	restoresCheckpointId?: string;
	restoredCheckpointToolId?: string;
}

/**
 * A page rename, so a restore can put the old title back on both the page
 * and the menu item that follows it.
 */
export interface PageRename {
	pageId: number | string;
	from: string;
	to: string;
}

export interface CheckpointRecord extends CheckpointMetadata {
	id: string;
	checkpointKeys: string[];
	createdAt: number;
	themeBeforeUpdate?: Required< GlobalStylesRecord >;
	logoBeforeUpdate?: SiteLogo;
	siteTitleBeforeUpdate?: string;
	siteMetadataBeforeUpdate?: SiteMetadata;
	// A list, not a map: object keys are strings, and a menu id is a post id —
	// restoring under the wrong type would address a different record.
	menusBeforeUpdate?: { id: MenuId; items: NavigationBlock[] }[];
	pageRenames?: PageRename[];
	// The eager domains a batch write reached; one it never wrote is dropped.
	writtenKeys?: string[];
}

const records = new Map< string, CheckpointRecord >();

// JSON round-trip like Big Sky: snapshots must not share references with the
// live edited record, and non-serializable values must not survive into them.
const deepClone = < T >( value: T ): T => JSON.parse( JSON.stringify( value ) );

function captureThemeSnapshot(): Required< GlobalStylesRecord > | undefined {
	const globalStyles = getEditedGlobalStyles();

	return globalStyles && deepClone( globalStyles.record );
}

// Throws instead of no-opping when the snapshot or target is missing — a
// silent skip would let the agent report an undo that never happened.
function restoreThemeSnapshot( checkpoint: CheckpointRecord ): void {
	const restoresTheme = checkpoint.checkpointKeys.some( ( key ) =>
		THEME_CHECKPOINT_KEYS.includes( key )
	);

	if ( ! restoresTheme ) {
		return;
	}

	if ( ! checkpoint.themeBeforeUpdate ) {
		throw new Error( 'Checkpoint has no global-styles snapshot to restore.' );
	}

	const globalStyles = getEditedGlobalStyles();

	if ( ! globalStyles ) {
		throw new Error( 'Global styles are unavailable to restore into.' );
	}

	editGlobalStyles( globalStyles.id, checkpoint.themeBeforeUpdate );
}

function restoreLogoSnapshot( checkpoint: CheckpointRecord ): void {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.LOGO ) ) {
		return;
	}

	if ( checkpoint.logoBeforeUpdate === undefined ) {
		throw new Error( 'Checkpoint has no site-logo snapshot to restore.' );
	}

	setSiteLogo( checkpoint.logoBeforeUpdate );
}

async function restoreSiteTitleSnapshot( checkpoint: CheckpointRecord ): Promise< void > {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.SITE_TITLE ) ) {
		return;
	}

	if ( checkpoint.siteTitleBeforeUpdate === undefined ) {
		throw new Error( 'Checkpoint has no site-title snapshot to restore.' );
	}

	await setSiteTitle( checkpoint.siteTitleBeforeUpdate );
}

async function restoreSiteMetadataSnapshot( checkpoint: CheckpointRecord ): Promise< void > {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.SITE_METADATA ) ) {
		return;
	}

	if ( ! checkpoint.siteMetadataBeforeUpdate ) {
		throw new Error( 'Checkpoint has no site-metadata snapshot to restore.' );
	}

	await replaceSiteMetadata( checkpoint.siteMetadataBeforeUpdate );
}

/**
 * Puts back the menus the write changed.
 *
 * Key-gated like every restore. An empty snapshot is valid here, unlike the
 * domains above, which throw: those capture the moment their key is claimed,
 * so nothing to restore means the capture failed. Page and navigation are
 * claimed up front but captured only if the write reaches them — a rename to
 * a page's existing title records nothing, and has nothing to undo.
 */
async function restoreMenuSnapshots( checkpoint: CheckpointRecord ): Promise< void > {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.NAVIGATION ) ) {
		return;
	}

	await Promise.all(
		( checkpoint.menusBeforeUpdate ?? [] ).map( ( menu ) => writeMenuItems( menu.id, menu.items ) )
	);
}

/**
 * Puts renamed page titles back, newest first: two renames of one page in the
 * same write must unwind in reverse, or the older title would be overwritten
 * by the newer one.
 *
 * The menu items follow from `menusBeforeUpdate`, which a rename snapshots —
 * relabelling them here would overwrite a label the user had chosen with the
 * page's old title.
 */
async function restorePageRenames( checkpoint: CheckpointRecord ): Promise< void > {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.PAGE ) ) {
		return;
	}

	for ( const rename of [ ...( checkpoint.pageRenames ?? [] ) ].reverse() ) {
		await setPageTitle( rename.pageId, rename.from );
	}
}

/**
 * Snapshots the current editor state under the given id; the keys scope what
 * a restore applies.
 */
export function setCheckpoint(
	id: string,
	keys: string[],
	metadata: CheckpointMetadata = {}
): void {
	if ( ! id ) {
		return;
	}

	records.set( id, {
		...metadata,
		id,
		checkpointKeys: keys,
		createdAt: Date.now(),
		...captureSnapshots( keys ),
	} );
}

/**
 * The domains that snapshot the moment their key is claimed — cheap reads of
 * one record each. The page and navigation domains arrive through the
 * `CheckpointRecorder` instead.
 */
function captureSnapshots( keys: string[] ): Partial< CheckpointRecord > {
	const themeBeforeUpdate = keys.some( ( key ) => THEME_CHECKPOINT_KEYS.includes( key ) )
		? captureThemeSnapshot()
		: undefined;
	const logoBeforeUpdate = keys.includes( checkpointKeys.LOGO ) ? getSiteLogo() : undefined;
	const siteTitleBeforeUpdate = keys.includes( checkpointKeys.SITE_TITLE )
		? getSiteTitle()
		: undefined;
	const siteMetadataBeforeUpdate = keys.includes( checkpointKeys.SITE_METADATA )
		? getSiteMetadata()
		: undefined;

	return {
		...( themeBeforeUpdate && { themeBeforeUpdate } ),
		...( logoBeforeUpdate !== undefined && { logoBeforeUpdate } ),
		...( siteTitleBeforeUpdate !== undefined && { siteTitleBeforeUpdate } ),
		...( siteMetadataBeforeUpdate && {
			siteMetadataBeforeUpdate: deepClone( siteMetadataBeforeUpdate ),
		} ),
	};
}

const SITE_KEYS: string[] = [ checkpointKeys.SITE_TITLE, checkpointKeys.SITE_METADATA ];

const EAGER_KEYS: string[] = [ ...SITE_KEYS, checkpointKeys.LOGO, ...THEME_CHECKPOINT_KEYS ];

const hasSnapshot = ( checkpoint: CheckpointRecord, key: string ): boolean =>
	( key === checkpointKeys.SITE_TITLE && checkpoint.siteTitleBeforeUpdate !== undefined ) ||
	( key === checkpointKeys.SITE_METADATA && !! checkpoint.siteMetadataBeforeUpdate ) ||
	( key === checkpointKeys.LOGO && checkpoint.logoBeforeUpdate !== undefined ) ||
	( THEME_CHECKPOINT_KEYS.includes( key ) && !! checkpoint.themeBeforeUpdate );

/**
 * Records the state a restore is about to overwrite, so its redo can step back.
 *
 * The page and navigation domains are out of `setCheckpoint()`'s reach — they
 * are only discovered mid-write — so they are taken from the checkpoint being
 * restored: the menus it touched, read as they stand right now, and its renames
 * flipped. Without them the redo would claim both domains and put nothing back.
 */
export async function setReciprocalCheckpoint(
	id: string,
	target: CheckpointRecord,
	metadata: CheckpointMetadata
): Promise< void > {
	// Read before anything is recorded, so a failure here leaves no half-built
	// reciprocal behind. A menu that cannot be read would give the redo a
	// navigation domain it could not honour, which is worse than no redo.
	const menusBeforeUpdate = await Promise.all(
		( target.menusBeforeUpdate ?? [] ).map( async ( menu ) => {
			const items = await readMenuItems( menu.id );

			if ( ! items ) {
				throw new Error( `Navigation menu not found: ${ menu.id }` );
			}

			return { id: menu.id, items: deepClone( items ) };
		} )
	);

	// Each page's title as it stands now, not the one the target recorded: the
	// page may have been renamed again since, and a redo has to return to what
	// the undo is about to overwrite. One entry per page, so a page renamed
	// twice in the target does not replay through its intermediate title.
	const renamedPageIds = [ ...new Set( ( target.pageRenames ?? [] ).map( ( r ) => r.pageId ) ) ];
	const pageRenames = await Promise.all(
		renamedPageIds.map( async ( pageId ) => {
			const current = await getPageTitle( pageId );

			return { pageId, from: current, to: current };
		} )
	);

	setCheckpoint( id, target.checkpointKeys, metadata );

	const checkpoint = records.get( id );

	if ( ! checkpoint ) {
		return;
	}

	// A redo claiming a domain it could not snapshot would throw part-way,
	// like any restore with one missing — refused whole instead.
	const missing = target.checkpointKeys.filter(
		( key ) => EAGER_KEYS.includes( key ) && ! hasSnapshot( checkpoint, key )
	);

	if ( missing.length ) {
		records.delete( id );

		throw new Error( `Could not snapshot ${ missing.join( ', ' ) } for a redo.` );
	}

	records.set( id, {
		...checkpoint,
		...( menusBeforeUpdate.length && { menusBeforeUpdate } ),
		...( pageRenames.length && { pageRenames } ),
	} );
}

export function hasCheckpoint( id: string ): boolean {
	return records.has( id );
}

export function getCheckpoint( id: string ): CheckpointRecord | undefined {
	return records.get( id );
}

export function clearCheckpoint( id: string ): void {
	records.delete( id );
}

/**
 * What a write can add to its own checkpoint while it runs.
 *
 * The page and navigation domains cannot be snapshotted up front: which page
 * is being renamed, and which menu follows it, is only known once the write
 * reaches them. A write with no checkpoint gets a recorder that does nothing,
 * so callers never branch on whether one exists.
 */
export interface CheckpointRecorder {
	/**
	 * Snapshots a menu before this write edits it, keeping the first snapshot
	 * per menu. Reports whether this call is the one that took it, so a caller
	 * discards only its own.
	 */
	captureMenu: ( menuId: MenuId ) => Promise< boolean >;
	/** Records a rename so a restore can put the old title back. */
	capturePageRename: ( rename: PageRename ) => void;
	/** Drops a menu snapshot whose write then failed. */
	discardMenu: ( menuId: MenuId ) => void;
	/** Marks an up-front domain as written, so a batch failing before it keeps no undo for it. */
	markWritten: ( key: string ) => void;
}

const NO_RECORDER: CheckpointRecorder = {
	captureMenu: async () => false,
	capturePageRename: () => {},
	discardMenu: () => {},
	markWritten: () => {},
};

function createRecorder( checkpointId: string ): CheckpointRecorder {
	const update = ( change: Partial< CheckpointRecord > ) => {
		const checkpoint = records.get( checkpointId );

		if ( checkpoint ) {
			records.set( checkpointId, { ...checkpoint, ...change } );
		}
	};

	// Recorded domains are key-gated the same way the up-front snapshots are,
	// so a restore can only ever touch what the write declared it would.
	const claims = ( checkpoint: CheckpointRecord | undefined, key: string ) =>
		!! checkpoint?.checkpointKeys.includes( key );

	return {
		captureMenu: async ( menuId ) => {
			const checkpoint = records.get( checkpointId );
			const captured = checkpoint?.menusBeforeUpdate ?? [];

			// First capture wins: a later edit in the same write must not
			// snapshot a menu this write has already changed.
			if (
				! claims( checkpoint, checkpointKeys.NAVIGATION ) ||
				captured.some( ( menu ) => isSameMenuId( menu.id, menuId ) )
			) {
				return false;
			}

			const items = await readMenuItems( menuId );

			// Refused rather than skipped: the caller is about to edit this menu,
			// and without the snapshot that edit could never be undone.
			if ( ! items ) {
				throw new Error( `Navigation menu not found: ${ menuId }` );
			}

			update( {
				menusBeforeUpdate: [ ...captured, { id: menuId, items: deepClone( items ) } ],
			} );

			return true;
		},
		discardMenu: ( menuId ) => {
			const checkpoint = records.get( checkpointId );

			if ( checkpoint?.menusBeforeUpdate?.length ) {
				update( {
					menusBeforeUpdate: checkpoint.menusBeforeUpdate.filter(
						( menu ) => ! isSameMenuId( menu.id, menuId )
					),
				} );
			}
		},

		capturePageRename: ( rename ) => {
			const checkpoint = records.get( checkpointId );

			if ( claims( checkpoint, checkpointKeys.PAGE ) ) {
				update( { pageRenames: [ ...( checkpoint?.pageRenames ?? [] ), rename ] } );
			}
		},

		markWritten: ( key ) => {
			const written = records.get( checkpointId )?.writtenKeys ?? [];

			if ( ! written.includes( key ) ) {
				update( { writtenKeys: [ ...written, key ] } );
			}
		},
	};
}

/**
 * Drops domains the write claimed but never recorded, and the checkpoint with
 * them when nothing is left.
 *
 * Page and navigation are claimed from the request alone, so a rename to the
 * title a page already has claims both and records neither — an undo that
 * restores nothing, and looks like it should where the same request changed
 * content too.
 */
function dropUnrecordedDomains( id: string ): void {
	const checkpoint = records.get( id );

	if ( ! checkpoint ) {
		return;
	}

	const renamed = !! checkpoint.pageRenames?.length;
	const written = ( key: string ) => !! checkpoint.writtenKeys?.includes( key );
	const restorable: Record< string, boolean > = {
		[ checkpointKeys.PAGE ]: renamed,
		[ checkpointKeys.NAVIGATION ]: renamed || !! checkpoint.menusBeforeUpdate?.length,
		// The site domains snapshot up front but are written mid-batch, so both
		// are needed there: a site record that could not be read leaves the key
		// claimed with nothing behind it, and a batch that failed before the
		// site edit never changed what the snapshot would put back.
		...Object.fromEntries(
			EAGER_KEYS.map( ( key ) => [
				key,
				hasSnapshot( checkpoint, key ) && ( ! SITE_KEYS.includes( key ) || written( key ) ),
			] )
		),
	};

	const checkpointKeysLeft = checkpoint.checkpointKeys.filter(
		( key ) => restorable[ key ] ?? true
	);

	if ( ! checkpointKeysLeft.length ) {
		records.delete( id );

		return;
	}

	records.set( id, { ...checkpoint, checkpointKeys: checkpointKeysLeft } );
}

/**
 * A repeat may reach domains the first run dropped as unrecorded, so it claims
 * them again. The ones that capture up front are snapshotted afresh: the first
 * run never wrote them, so what stands now is their pre-change state, and a
 * snapshot it left behind could predate a change made since.
 */
function redeclareDomains( id: string, keys: string[] ): void {
	const checkpoint = records.get( id );

	if ( ! checkpoint ) {
		return;
	}

	const added = keys.filter( ( key ) => ! checkpoint.checkpointKeys.includes( key ) );

	records.set( id, {
		...checkpoint,
		...captureSnapshots( added ),
		checkpointKeys: [ ...checkpoint.checkpointKeys, ...added ],
	} );
}

/**
 * Runs an ability's write under a checkpoint keyed by its tool call, so
 * `restore-checkpoint` can undo it. The first snapshot for a call wins — a
 * repeat must not overwrite the pre-change state. A write that fails drops the
 * checkpoint it created; a repeat that fails is rolled back to the first run's,
 * which still undoes the change that landed. Without a call id the write runs
 * uncheckpointed.
 */
export async function withCheckpoint< T >(
	{
		toolId,
		toolCallId,
		keys,
		summary,
	}: {
		toolId: string;
		/** The client's id for this call; read from the conversation history when absent. */
		toolCallId?: string;
		keys: string[];
		summary: string;
	},
	write: ( recorder: CheckpointRecorder ) => T | Promise< T >
): Promise< T > {
	const callId = toolCallId ?? getToolCallIdFromConversationHistory( toolId );

	// No keys means no domain to put back, and every restore is key-gated —
	// so a checkpoint here would offer the user an undo that does nothing.
	const checkpointId = keys.length && callId ? callId : null;

	// A repeat of the same call keeps the first snapshot but still records what
	// it touches; only the run that created the checkpoint may drop it.
	const created = !! checkpointId && ! hasCheckpoint( checkpointId );

	// A repeat's re-declared domains are put back as they were if it throws:
	// nothing landed, so nothing new is restorable.
	const before = checkpointId && ! created ? records.get( checkpointId ) : undefined;

	if ( created ) {
		setCheckpoint( checkpointId, keys, { toolId, summary } );
	} else if ( checkpointId ) {
		redeclareDomains( checkpointId, keys );
	}

	try {
		const result = await write( checkpointId ? createRecorder( checkpointId ) : NO_RECORDER );

		if ( checkpointId ) {
			dropUnrecordedDomains( checkpointId );
		}

		return result;
	} catch ( error ) {
		if ( created ) {
			clearCheckpoint( checkpointId );
		} else if ( before ) {
			records.set( checkpointId as string, before );
		}

		throw error;
	}
}

/** Returns all checkpoints, oldest first. */
export function getCheckpoints(): CheckpointRecord[] {
	return [ ...records.values() ];
}

/**
 * Restores the editor state a checkpoint captured, scoped to its keys.
 */
export async function restoreCheckpoint( id: string ): Promise< void > {
	const checkpoint = records.get( id );
	if ( ! checkpoint ) {
		throw new Error( `Checkpoint not found: ${ id }` );
	}

	restoreThemeSnapshot( checkpoint );
	restoreLogoSnapshot( checkpoint );
	await restoreSiteTitleSnapshot( checkpoint );
	await restoreSiteMetadataSnapshot( checkpoint );

	// Titles first: a page deleted since makes `setPageTitle()` throw, and that
	// has to happen before any menu is rewritten.
	await restorePageRenames( checkpoint );
	await restoreMenuSnapshots( checkpoint );
}

export interface CheckpointContextItem extends CheckpointMetadata {
	checkpointId: string;
	checkpointIndex: number;
	checkpointKeys: string[];
	createdAt: number;
	isLatestForTool?: boolean;
}

/**
 * The AM-held checkpoints advertised to the agent via the client context for
 * `restore-checkpoint`. While the migration runs, the loader appends them to
 * the provider's own list, and ids from either store restore.
 */
export function getAvailableCheckpoints(): CheckpointContextItem[] {
	const checkpoints = getCheckpoints();
	const latestIndexByToolId: Record< string, number > = {};
	checkpoints.forEach( ( { toolId }, index ) => {
		if ( toolId ) {
			latestIndexByToolId[ toolId ] = index;
		}
	} );

	// Snapshots stay out of the model-facing list: they carry whole global-styles
	// records, menu block trees and site metadata, none of which the agent needs
	// and all of which would be re-sent every turn.
	return checkpoints.map(
		(
			{
				id,
				themeBeforeUpdate: _theme,
				logoBeforeUpdate: _logo,
				siteTitleBeforeUpdate: _siteTitle,
				siteMetadataBeforeUpdate: _siteMetadata,
				menusBeforeUpdate: _menus,
				pageRenames: _renames,
				writtenKeys: _written,
				...checkpoint
			},
			index
		) => ( {
			...checkpoint,
			checkpointId: id,
			checkpointIndex: index,
			...( checkpoint.toolId && {
				isLatestForTool: latestIndexByToolId[ checkpoint.toolId ] === index,
			} ),
		} )
	);
}
