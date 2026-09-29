import { serialize } from '@wordpress/blocks';
import { deepClone } from './deep-clone';
import {
	findTemplatePartClientId,
	getBlocks,
	getPageBlocks,
	getRootBlocks,
	getTemplatePartBlocks,
	replaceRootBlocks,
	resolveBlocksRoot,
	stageRootBlocks,
	type BlocksRoot,
	type CurrentPost,
	type EditorBlock,
	type PageBlocks,
	type TemplatePartBlocks,
} from './editor-blocks';
import {
	editGlobalStyles,
	getCustomCss,
	getEditedGlobalStyles,
	setCustomCss,
	type GlobalStylesRecord,
} from './global-styles';
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
import { recordBigSkyTracksEvent } from './tracks';
import type { Block } from '@wordpress/blocks';

/**
 * AM-owned checkpoint store: in-memory, per page load, keyed by tool call id.
 *
 * Ported from Big Sky's `use-checkpoint` as plain functions, since AM abilities
 * execute as plain callbacks. Every migrated domain restores here: global
 * styles, custom CSS, the site logo, the site title, site metadata, pages,
 * navigation and the page's blocks.
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
	BLOCKS: 'blocks',
	CUSTOM_CSS: 'custom_css',
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
	createdByRequestIntentType?: 'undo' | 'redo' | 'restore';
	restoresCheckpointId?: string;
	restoredCheckpointToolId?: string;
}

/**
 * A page rename, so a restore can put the old title back on both the page
 * and the menu item that follows it.
 */
interface PageRename {
	pageId: number | string;
	from: string;
	to: string;
}

/**
 * The page's blocks under the root a write went into, the template parts shown
 * beside them (the editor keeps their blocks apart from the tree), and the post
 * they belong to. The root is recorded by kind and resolved again on restore:
 * its clientId does not survive the editor remounting.
 */
interface BlocksSnapshot extends PageBlocks {
	rootKind: BlocksRoot[ 'kind' ];
	post: CurrentPost;
}

/**
 * The chat's inline Undo / Redo on a text edit: which way the next swap goes,
 * the page markup it expects to find (swapping over a page that changed since
 * would wipe those changes), and the tool the edit came from, which the
 * record takes back as its `toolId` once a swap puts the edit back.
 */
interface InlineSwap {
	action: 'undo' | 'redo';
	expectedSignature: string;
	toolId?: string;
}

export interface CheckpointRecord extends CheckpointMetadata {
	id: string;
	checkpointKeys: string[];
	createdAt: number;
	themeBeforeUpdate?: Required< GlobalStylesRecord >;
	logoBeforeUpdate?: SiteLogo;
	blocksBeforeUpdate?: BlocksSnapshot;
	customCssBeforeUpdate?: string;
	siteTitleBeforeUpdate?: string;
	siteMetadataBeforeUpdate?: SiteMetadata;
	// A list, not a map: object keys are strings, and a menu id is a post id —
	// restoring under the wrong type would address a different record.
	menusBeforeUpdate?: { id: MenuId; items: NavigationBlock[] }[];
	pageRenames?: PageRename[];
	// The eager domains a batch write reached; one it never wrote is dropped.
	writtenKeys?: string[];
	inlineSwap?: InlineSwap;
}

const records = new Map< string, CheckpointRecord >();

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

function captureCustomCssSnapshot(): string | undefined {
	const globalStyles = getEditedGlobalStyles();

	return globalStyles && getCustomCss( globalStyles.record );
}

function restoreCustomCssSnapshot( checkpoint: CheckpointRecord ): void {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.CUSTOM_CSS ) ) {
		return;
	}

	if ( checkpoint.customCssBeforeUpdate === undefined ) {
		throw new Error( 'Checkpoint has no custom-CSS snapshot to restore.' );
	}

	const globalStyles = getEditedGlobalStyles();

	if ( ! globalStyles ) {
		throw new Error( 'Global styles are unavailable to restore into.' );
	}

	setCustomCss( globalStyles, checkpoint.customCssBeforeUpdate );
}

const snapshotBlocks = ( root: BlocksRoot ): BlocksSnapshot => ( {
	rootKind: root.kind,
	post: root.post,
	...deepClone( getPageBlocks() ),
} );

const captureBlocksSnapshot = (): BlocksSnapshot | undefined => {
	const root = resolveBlocksRoot();

	return root ? snapshotBlocks( root ) : undefined;
};

// The editor hands out the id as a number or a string, depending on the surface.
const isSnapshotRoot = ( root: BlocksRoot, snapshot: BlocksSnapshot ): boolean =>
	root.kind === snapshot.rootKind &&
	String( root.post.id ) === String( snapshot.post.id ) &&
	root.post.type === snapshot.post.type;

const countBlocks = ( blocks: EditorBlock[] ): number =>
	blocks.reduce( ( count, block ) => count + 1 + countBlocks( block.innerBlocks ), 0 );

// The page's markup, with the JSON standing in when a block cannot serialize.
function toMarkup( blocks: EditorBlock[] ): string {
	try {
		return serialize( blocks as Block[] );
	} catch {
		return JSON.stringify( blocks );
	}
}

// Recorded under Big Sky's event name so its dashboard keeps counting.
function recordBlockedRestore(
	reason: 'editor_scope_mismatch' | 'content_shrink' | 'template_part_would_empty',
	checkpoint: CheckpointRecord,
	snapshot: BlocksSnapshot,
	current: { post?: CurrentPost; blocks: EditorBlock[] }
): void {
	recordBigSkyTracksEvent( 'jetpack_big_sky_checkpoint_restore_blocked', {
		reason,
		checkpoint_id: checkpoint.id,
		checkpoint_tool_id: checkpoint.toolId ?? '',
		current_post_id: current.post?.id ?? '',
		current_post_type: current.post?.type ?? '',
		checkpoint_post_id: snapshot.post.id,
		checkpoint_post_type: snapshot.post.type,
		current_block_count: countBlocks( current.blocks ),
		restore_block_count: countBlocks( snapshot.blocks ),
		current_serialized_length: toMarkup( current.blocks ).length,
		restore_serialized_length: toMarkup( snapshot.blocks ).length,
	} );
}

// The root is resolved again, so a write lands where the page is now, and
// only on the page the snapshot was taken from.
function resolveSnapshotRoot( checkpoint: CheckpointRecord, snapshot: BlocksSnapshot ): BlocksRoot {
	const root = resolveBlocksRoot();

	if ( root && isSnapshotRoot( root, snapshot ) ) {
		return root;
	}

	recordBlockedRestore( 'editor_scope_mismatch', checkpoint, snapshot, {
		post: root?.post,
		blocks: root ? getRootBlocks( root.clientId ) : [],
	} );

	const { title, type, id } = snapshot.post;

	throw new Error(
		`The checkpoint belongs to ${
			title ? `“${ title }”` : `${ type } ${ id }`
		}, which is not open now. Open it to restore.`
	);
}

// A snapshot taken before the canvas had loaded would wipe the page if put back.
function throwIfRestoreCollapsesPage(
	checkpoint: CheckpointRecord,
	snapshot: BlocksSnapshot,
	root: BlocksRoot
): void {
	const current = getRootBlocks( root.clientId );
	const currentCount = countBlocks( current );
	const currentLength = toMarkup( current ).length;
	const collapses =
		( currentCount >= 5 && countBlocks( snapshot.blocks ) <= 2 ) ||
		( currentLength >= 1000 && toMarkup( snapshot.blocks ).length < currentLength * 0.2 );

	if ( ! collapses ) {
		return;
	}

	recordBlockedRestore( 'content_shrink', checkpoint, snapshot, {
		post: root.post,
		blocks: current,
	} );

	throw new Error(
		'Checkpoint restore was blocked because it would replace the current editor content with a much smaller block snapshot.'
	);
}

// A sealed checkpoint restores over the page as the swap left it and nothing
// else: the snapshot replaces the whole root, so later changes would go with it.
function throwIfSealedPageDrifted( checkpoint: CheckpointRecord, root: BlocksRoot ): void {
	if (
		checkpoint.inlineSwap &&
		checkpoint.inlineSwap.expectedSignature !== getBlocksSignature( root )
	) {
		throw new Error(
			'Checkpoint restore was blocked because the editor content changed after the checkpoint was created.'
		);
	}
}

/**
 * The snapshotted template parts that differ from the page: writing a part
 * marks it as edited, so one the write never changed is left alone. A part the
 * page no longer shows refuses the restore, as another page does. An empty
 * snapshot over a part with content is skipped and recorded: a part still
 * loading reads as empty, and the next save would commit it that way.
 */
function resolveSnapshotParts(
	checkpoint: CheckpointRecord,
	snapshot: BlocksSnapshot,
	root: BlocksRoot
): { clientId: string; blocks: EditorBlock[] }[] {
	return snapshot.templateParts.flatMap( ( { slug, blocks } ) => {
		const clientId = findTemplatePartClientId( slug );

		if ( ! clientId ) {
			throw new Error(
				`The checkpoint's “${ slug }” template part is not on this page. Open the page it was taken from to restore.`
			);
		}

		const current = getBlocks( clientId );

		if ( ! blocks.length && current.length ) {
			recordBlockedRestore( 'template_part_would_empty', checkpoint, snapshot, {
				post: root.post,
				blocks: getRootBlocks( root.clientId ),
			} );

			return [];
		}

		return toMarkup( current ) === toMarkup( blocks ) ? [] : [ { clientId, blocks } ];
	} );
}

/**
 * Puts the snapshotted page back. Outside the undo stack, as every agent
 * restore is: `restore-checkpoint` records its own reciprocal, and that is the
 * way back. The chat's inline swap writes tracked instead, since it behaves as
 * the editor's own Undo.
 */
function restoreBlocksSnapshot( checkpoint: CheckpointRecord, { tracked = false } = {} ): void {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.BLOCKS ) ) {
		return;
	}

	const snapshot = checkpoint.blocksBeforeUpdate;

	if ( ! snapshot ) {
		throw new Error( 'Checkpoint has no blocks snapshot to restore.' );
	}

	const root = resolveSnapshotRoot( checkpoint, snapshot );

	throwIfSealedPageDrifted( checkpoint, root );
	throwIfRestoreCollapsesPage( checkpoint, snapshot, root );

	// Resolved before any write: a missing part refuses the whole restore.
	const parts = resolveSnapshotParts( checkpoint, snapshot, root );
	const write = tracked ? replaceRootBlocks : stageRootBlocks;

	write( root.clientId, deepClone( snapshot.blocks ) );
	parts.forEach( ( { clientId, blocks } ) => write( clientId, deepClone( blocks ) ) );
}

let signatureCache: { blocks: EditorBlock[]; parts: TemplatePartBlocks[]; signature: string };

/**
 * The page's markup, root and template parts, as one string. Cached on the
 * store's own array identities: the chat asks after every render, and the
 * store hands out the same arrays until a block changes.
 */
function getBlocksSignature( root: BlocksRoot ): string {
	const blocks = getRootBlocks( root.clientId );
	const parts = getTemplatePartBlocks();
	const cached = signatureCache;
	const isCached =
		cached?.blocks === blocks &&
		cached.parts.length === parts.length &&
		cached.parts.every(
			( part, index ) => part.slug === parts[ index ].slug && part.blocks === parts[ index ].blocks
		);

	if ( isCached ) {
		return cached.signature;
	}

	const signature = JSON.stringify( [
		toMarkup( blocks ),
		...parts.map( ( part ) => [ part.slug, toMarkup( part.blocks ) ] ),
	] );

	signatureCache = { blocks, parts, signature };

	return signature;
}

/**
 * Offers a checkpoint to the chat's inline Undo, which swaps the page between
 * the states before and after the edit. Only a checkpoint that holds nothing
 * but the page's blocks can swap, and only while the page stays as the edit
 * left it. Reports whether the seal was set.
 */
export function sealCheckpointForSwap( id: string ): boolean {
	const checkpoint = records.get( id );
	const root = resolveBlocksRoot();
	const holdsBlocksOnly =
		checkpoint?.blocksBeforeUpdate &&
		checkpoint.checkpointKeys.length === 1 &&
		checkpoint.checkpointKeys[ 0 ] === checkpointKeys.BLOCKS;

	if ( ! holdsBlocksOnly || ! root ) {
		return false;
	}

	records.set( id, {
		...checkpoint,
		inlineSwap: {
			action: 'undo',
			expectedSignature: getBlocksSignature( root ),
			toolId: checkpoint.toolId,
		},
	} );

	return true;
}

/**
 * `undefined` for a checkpoint that was never sealed, which restores one way
 * through `restore-checkpoint`; otherwise whether the page is still as the
 * last swap left it, on the page the checkpoint belongs to.
 */
export function canSwapCheckpoint( id: string ): boolean | undefined {
	const checkpoint = records.get( id );
	const snapshot = checkpoint?.blocksBeforeUpdate;

	if ( ! checkpoint?.inlineSwap || ! snapshot ) {
		return undefined;
	}

	const root = resolveBlocksRoot();

	return (
		!! root &&
		isSnapshotRoot( root, snapshot ) &&
		getBlocksSignature( root ) === checkpoint.inlineSwap.expectedSignature
	);
}

/**
 * Swaps the page to the other side of a sealed checkpoint, as a tracked write
 * so the editor's own Undo sees it. The record then holds the state just
 * replaced, ready for the swap back, and reads to the agent as the restore it
 * was, so a redo request finds it.
 */
export async function swapCheckpoint( id: string ): Promise< void > {
	const checkpoint = records.get( id );
	const root = resolveBlocksRoot();

	if ( ! checkpoint?.inlineSwap || ! root || canSwapCheckpoint( id ) !== true ) {
		throw new Error(
			'Checkpoint swap was blocked because the editor content changed or the checkpoint is not a text edit.'
		);
	}

	const { action, toolId } = checkpoint.inlineSwap;
	const nextAction = action === 'undo' ? 'redo' : 'undo';
	const current = snapshotBlocks( root );

	restoreBlocksSnapshot( checkpoint, { tracked: true } );

	records.set( id, {
		...checkpoint,
		blocksBeforeUpdate: current,
		toolId: nextAction === 'redo' ? RESTORE_CHECKPOINT_TOOL_ID : toolId,
		requestIntentType: nextAction,
		createdByRequestIntentType: action,
		inlineSwap: { action: nextAction, expectedSignature: getBlocksSignature( root ), toolId },
	} );
}

function restoreSiteTitleSnapshot( checkpoint: CheckpointRecord ): void {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.SITE_TITLE ) ) {
		return;
	}

	if ( checkpoint.siteTitleBeforeUpdate === undefined ) {
		throw new Error( 'Checkpoint has no site-title snapshot to restore.' );
	}

	setSiteTitle( checkpoint.siteTitleBeforeUpdate );
}

function restoreSiteMetadataSnapshot( checkpoint: CheckpointRecord ): void {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.SITE_METADATA ) ) {
		return;
	}

	if ( ! checkpoint.siteMetadataBeforeUpdate ) {
		throw new Error( 'Checkpoint has no site-metadata snapshot to restore.' );
	}

	replaceSiteMetadata( checkpoint.siteMetadataBeforeUpdate );
}

/**
 * Puts back the menus the write changed.
 *
 * An empty snapshot is valid here, unlike the domains above, which throw: those
 * capture the moment their key is claimed, so nothing to restore means the
 * capture failed. Navigation is claimed up front but captured only as the write
 * reaches each menu.
 */
async function restoreMenuSnapshots( checkpoint: CheckpointRecord ): Promise< void > {
	if ( ! checkpoint.checkpointKeys.includes( checkpointKeys.NAVIGATION ) ) {
		return;
	}

	const menus = checkpoint.menusBeforeUpdate ?? [];
	const items = await Promise.all( menus.map( ( menu ) => readMenuItems( menu.id ) ) );
	const missing = items.findIndex( ( current ) => ! current );

	// Checked before any write: a menu deleted since would fail inside the
	// store, after the others were already put back.
	if ( missing >= 0 ) {
		throw new Error( `Navigation menu not found: ${ menus[ missing ].id }` );
	}

	await Promise.all( menus.map( ( menu ) => writeMenuItems( menu.id, menu.items ) ) );
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
	const blocksBeforeUpdate = keys.includes( checkpointKeys.BLOCKS )
		? captureBlocksSnapshot()
		: undefined;
	const customCssBeforeUpdate = keys.includes( checkpointKeys.CUSTOM_CSS )
		? captureCustomCssSnapshot()
		: undefined;
	const siteTitleBeforeUpdate = keys.includes( checkpointKeys.SITE_TITLE )
		? getSiteTitle()
		: undefined;
	const siteMetadataBeforeUpdate = keys.includes( checkpointKeys.SITE_METADATA )
		? getSiteMetadata()
		: undefined;

	return {
		...( themeBeforeUpdate && { themeBeforeUpdate } ),
		...( logoBeforeUpdate !== undefined && { logoBeforeUpdate } ),
		...( blocksBeforeUpdate && { blocksBeforeUpdate } ),
		...( customCssBeforeUpdate !== undefined && { customCssBeforeUpdate } ),
		...( siteTitleBeforeUpdate !== undefined && { siteTitleBeforeUpdate } ),
		...( siteMetadataBeforeUpdate && {
			siteMetadataBeforeUpdate: deepClone( siteMetadataBeforeUpdate ),
		} ),
	};
}

// The eager domains a batch write reaches part-way through, so a batch that
// failed before them never changed what their snapshot would put back.
const MID_BATCH_KEYS: string[] = [
	checkpointKeys.SITE_TITLE,
	checkpointKeys.SITE_METADATA,
	checkpointKeys.BLOCKS,
	checkpointKeys.CUSTOM_CSS,
];

/** The record field each domain that snapshots up front captures into. */
const SNAPSHOT_FIELDS: Record< string, keyof CheckpointRecord > = {
	[ checkpointKeys.SITE_TITLE ]: 'siteTitleBeforeUpdate',
	[ checkpointKeys.SITE_METADATA ]: 'siteMetadataBeforeUpdate',
	[ checkpointKeys.LOGO ]: 'logoBeforeUpdate',
	[ checkpointKeys.BLOCKS ]: 'blocksBeforeUpdate',
	[ checkpointKeys.CUSTOM_CSS ]: 'customCssBeforeUpdate',
	...Object.fromEntries( THEME_CHECKPOINT_KEYS.map( ( key ) => [ key, 'themeBeforeUpdate' ] ) ),
};

const EAGER_KEYS = Object.keys( SNAPSHOT_FIELDS );

const hasSnapshot = ( checkpoint: CheckpointRecord, key: string ): boolean =>
	key in SNAPSHOT_FIELDS && checkpoint[ SNAPSHOT_FIELDS[ key ] ] !== undefined;

/** The eager domains among `keys` whose snapshot could not be taken. */
const missingSnapshots = ( checkpoint: CheckpointRecord, keys: string[] ): string[] =>
	keys.filter( ( key ) => EAGER_KEYS.includes( key ) && ! hasSnapshot( checkpoint, key ) );

/**
 * Records the state a restore is about to overwrite, so its redo can step back.
 *
 * The page and navigation domains are only discovered mid-write, so they come
 * from the checkpoint being restored: the menus it touched, read as they stand
 * now, and its renames flipped.
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

	// The blocks as they stand now, under the root the target wrote into. A page
	// showing another root or post could not take the redo, so it gets none.
	const blocksBeforeUpdate = target.blocksBeforeUpdate
		? snapshotBlocks( resolveSnapshotRoot( target, target.blocksBeforeUpdate ) )
		: undefined;

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
	const missing = missingSnapshots( checkpoint, target.checkpointKeys );

	if ( missing.length ) {
		records.delete( id );

		throw new Error( `Could not snapshot ${ missing.join( ', ' ) } for a redo.` );
	}

	records.set( id, {
		...checkpoint,
		...( blocksBeforeUpdate && { blocksBeforeUpdate } ),
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

			// Re-read after the await: another capture may have landed meanwhile.
			update( {
				menusBeforeUpdate: [
					...( records.get( checkpointId )?.menusBeforeUpdate ?? [] ),
					{ id: menuId, items: deepClone( items ) },
				],
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
 * title a page already has claims both and records neither — leaving an undo
 * that would restore nothing.
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
		// The mid-batch domains need both: a record that could not be read leaves
		// the key claimed with nothing behind it, and a batch that never reached
		// the domain left its snapshot with nothing to put back.
		...Object.fromEntries(
			EAGER_KEYS.map( ( key ) => [
				key,
				hasSnapshot( checkpoint, key ) && ( ! MID_BATCH_KEYS.includes( key ) || written( key ) ),
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
 * A repeat claims again the domains the first run dropped as unrecorded. Those
 * that capture up front are snapshotted afresh: the first run never wrote them,
 * so what stands now is their pre-change state.
 */
function redeclareDomains( id: string, keys: string[] ): void {
	const checkpoint = records.get( id );

	if ( ! checkpoint ) {
		return;
	}

	const added = keys.filter( ( key ) => ! checkpoint.checkpointKeys.includes( key ) );
	// Cleared before the fresh capture: kept, an old snapshot would stand in
	// for one that could not be taken, and the write would run unrefused.
	const cleared = Object.fromEntries(
		added
			.filter( ( key ) => key in SNAPSHOT_FIELDS )
			.map( ( key ) => [ SNAPSHOT_FIELDS[ key ], undefined ] )
	);

	records.set( id, {
		...checkpoint,
		...cleared,
		...captureSnapshots( added ),
		checkpointKeys: [ ...checkpoint.checkpointKeys, ...added ],
	} );
}

/**
 * Runs an ability's write under a checkpoint keyed by its tool call, so
 * `restore-checkpoint` can undo it. The first snapshot for a call wins; a repeat
 * that fails rolls back to it, and a first run that fails drops the checkpoint.
 * A domain that snapshots up front and cannot be read refuses the write before
 * it runs. Without a call id the write runs uncheckpointed.
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

	const undo = () => {
		if ( created ) {
			clearCheckpoint( checkpointId );
		} else if ( before ) {
			records.set( checkpointId as string, before );
		}
	};

	// Refused before the write, not made unrestorable: a domain that snapshots
	// up front and could not be read would leave the change with no way back.
	const missing = checkpointId ? missingSnapshots( records.get( checkpointId )!, keys ) : [];

	if ( missing.length ) {
		undo();

		throw new Error(
			`Cannot record a way back for ${ missing.join( ', ' ) }: its current state could not ` +
				'be read. Nothing was changed.'
		);
	}

	try {
		const result = await write( checkpointId ? createRecorder( checkpointId ) : NO_RECORDER );

		if ( checkpointId ) {
			dropUnrecordedDomains( checkpointId );
		}

		return result;
	} catch ( error ) {
		undo();

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

	// Blocks first: their guards refuse a restore from another page before
	// any site-wide domain is written.
	restoreBlocksSnapshot( checkpoint );
	restoreThemeSnapshot( checkpoint );
	restoreCustomCssSnapshot( checkpoint );
	restoreLogoSnapshot( checkpoint );
	restoreSiteTitleSnapshot( checkpoint );
	restoreSiteMetadataSnapshot( checkpoint );

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

	// Snapshots and the swap seal stay out of the model-facing list: they carry
	// whole global-styles records, menu block trees and site metadata, none of
	// which the agent needs and all of which would be re-sent every turn.
	return checkpoints.map(
		(
			{
				id,
				themeBeforeUpdate: _theme,
				logoBeforeUpdate: _logo,
				blocksBeforeUpdate: _blocks,
				customCssBeforeUpdate: _customCss,
				siteTitleBeforeUpdate: _siteTitle,
				siteMetadataBeforeUpdate: _siteMetadata,
				menusBeforeUpdate: _menus,
				pageRenames: _renames,
				writtenKeys: _written,
				inlineSwap: _inlineSwap,
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
			// The backend's redo rule reads the intent that created a restore; the
			// store keeps the flipped one.
			...( checkpoint.createdByRequestIntentType && {
				requestIntentType: checkpoint.createdByRequestIntentType,
			} ),
		} )
	);
}
