import { editGlobalStyles, getEditedGlobalStyles, type GlobalStylesRecord } from './global-styles';
import {
	readMenuItems,
	renameNavigationItem,
	writeMenu,
	type NavigationBlock,
} from './navigation-menu';
import { setPageTitle } from './page-title';
import { getSiteLogo, setSiteLogo, type SiteLogo } from './site-logo';
import { getSiteMetadata, replaceSiteMetadata, type SiteMetadata } from './site-metadata';
import { getSiteTitle, setSiteTitle } from './site-title';
import { getToolCallIdFromConversationHistory } from './tool-call-history';

/**
 * AM-owned checkpoint store: in-memory, per page load, keyed by tool call id.
 *
 * Ported from Big Sky's `use-checkpoint` as plain functions — AM abilities
 * execute as plain callbacks, so no hook wiring is needed. The global-styles,
 * site-logo, site-title, page, navigation and site-metadata domains restore
 * today; the block domain lands with `apply-block-edits`. Until then, checkpoints for it
 * live in Big Sky's store and restore through the `provider-checkpoints`
 * bridge.
 *
 * Big Sky additionally re-applies the checkpoint's variation titles after the
 * snapshot restore to sync its variation-selection store. AM has no such
 * store — the entity snapshot alone restores the full visual state.
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
	menusBeforeUpdate?: { id: number | string; items: NavigationBlock[] }[];
	pageRenames?: PageRename[];
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
 * Empty is a valid state here, unlike the domains above, which throw when a
 * claimed key has no snapshot. Those are captured the moment the key is
 * claimed, so nothing to restore means the capture failed. The page and
 * navigation domains are claimed up front and captured only if the write
 * turns out to touch them — a rename to the title a page already had records
 * nothing, and has nothing to undo.
 */
async function restoreMenuSnapshots( checkpoint: CheckpointRecord ): Promise< void > {
	await Promise.all(
		( checkpoint.menusBeforeUpdate ?? [] ).map( ( menu ) => writeMenu( menu.id, menu.items ) )
	);
}

/**
 * Puts renamed pages back, newest first: two renames of one page in the same
 * write must unwind in reverse, or the older title would be overwritten by
 * the newer one.
 */
async function restorePageRenames( checkpoint: CheckpointRecord ): Promise< void > {
	for ( const rename of [ ...( checkpoint.pageRenames ?? [] ) ].reverse() ) {
		await setPageTitle( rename.pageId, rename.from );
		await renameNavigationItem( rename.pageId, rename.from, rename.to );
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

	const themeBeforeUpdate = keys.some( ( key ) => THEME_CHECKPOINT_KEYS.includes( key ) )
		? captureThemeSnapshot()
		: undefined;
	const logoBeforeUpdate = keys.includes( checkpointKeys.LOGO ) ? getSiteLogo() : undefined;

	// Cheap reads of one record, so they snapshot up front. The page and
	// navigation domains arrive through the `CheckpointRecorder` instead.
	const siteTitleBeforeUpdate = keys.includes( checkpointKeys.SITE_TITLE )
		? getSiteTitle()
		: undefined;
	const siteMetadataBeforeUpdate = keys.includes( checkpointKeys.SITE_METADATA )
		? getSiteMetadata()
		: undefined;

	records.set( id, {
		...metadata,
		id,
		checkpointKeys: keys,
		createdAt: Date.now(),
		...( themeBeforeUpdate && { themeBeforeUpdate } ),
		...( logoBeforeUpdate !== undefined && { logoBeforeUpdate } ),
		...( siteTitleBeforeUpdate !== undefined && { siteTitleBeforeUpdate } ),
		...( siteMetadataBeforeUpdate && {
			siteMetadataBeforeUpdate: deepClone( siteMetadataBeforeUpdate ),
		} ),
	} );
}

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

	// Reversed before flipping: a restore unwinds newest first, so a call that
	// renamed one page twice needs its steps in the opposite order to replay.
	const pageRenames = [ ...( target.pageRenames ?? [] ) ]
		.reverse()
		.map( ( { pageId, from, to } ) => ( { pageId, from: to, to: from } ) );

	setCheckpoint( id, target.checkpointKeys, metadata );

	const checkpoint = records.get( id );

	if ( checkpoint ) {
		records.set( id, {
			...checkpoint,
			...( menusBeforeUpdate.length && { menusBeforeUpdate } ),
			...( pageRenames.length && { pageRenames } ),
		} );
	}
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
	/** Snapshots a menu before this write edits it. */
	captureMenu: ( menuId: string | number ) => Promise< void >;
	/** Records a rename so a restore can put the old title back. */
	capturePageRename: ( rename: PageRename ) => void;
}

const NO_RECORDER: CheckpointRecorder = {
	captureMenu: async () => {},
	capturePageRename: () => {},
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
				captured.some( ( menu ) => menu.id === menuId )
			) {
				return;
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
		},
		capturePageRename: ( rename ) => {
			const checkpoint = records.get( checkpointId );

			if ( claims( checkpoint, checkpointKeys.PAGE ) ) {
				update( { pageRenames: [ ...( checkpoint?.pageRenames ?? [] ), rename ] } );
			}
		},
	};
}

/**
 * Runs an ability's write under a checkpoint keyed by its tool call, so
 * `restore-checkpoint` can undo it. The first snapshot for a call wins — a
 * repeat must not overwrite the pre-change state — and a write that throws or
 * rejects drops its checkpoint, so no undo is offered for a change that never
 * happened. Without a call id the write runs uncheckpointed.
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
	const checkpointId = keys.length && callId && ! hasCheckpoint( callId ) ? callId : null;

	if ( checkpointId ) {
		setCheckpoint( checkpointId, keys, { toolId, summary } );
	}

	try {
		return await write( checkpointId ? createRecorder( checkpointId ) : NO_RECORDER );
	} catch ( error ) {
		if ( checkpointId ) {
			clearCheckpoint( checkpointId );
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

	// Menus first: a page rename relabels the menu item that follows it, so it
	// has to run against the menu this checkpoint put back.
	await restoreMenuSnapshots( checkpoint );
	await restorePageRenames( checkpoint );
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

	// Snapshots stay out of the model-facing list.
	return checkpoints.map(
		( { id, themeBeforeUpdate: _theme, logoBeforeUpdate: _logo, ...checkpoint }, index ) => ( {
			...checkpoint,
			checkpointId: id,
			checkpointIndex: index,
			...( checkpoint.toolId && {
				isLatestForTool: latestIndexByToolId[ checkpoint.toolId ] === index,
			} ),
		} )
	);
}
