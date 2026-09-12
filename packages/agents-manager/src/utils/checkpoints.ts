import { editGlobalStyles, getEditedGlobalStyles, type GlobalStylesRecord } from './global-styles';
import { getSiteLogo, setSiteLogo, type SiteLogo } from './site-logo';
import { getToolCallIdFromConversationHistory } from './tool-call-history';

/**
 * AM-owned checkpoint store: in-memory, per page load, keyed by tool call id.
 *
 * Ported from Big Sky's `use-checkpoint` as plain functions — AM abilities
 * execute as plain callbacks, so no hook wiring is needed. The global-styles
 * (`color`/`font`/`button`) and site-logo domains restore today; the block,
 * page, and navigation domains land with their abilities. Until then,
 * checkpoints for those domains live in Big Sky's store and restore through
 * the `provider-checkpoints` bridge.
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

export interface CheckpointRecord extends CheckpointMetadata {
	id: string;
	checkpointKeys: string[];
	createdAt: number;
	themeBeforeUpdate?: Required< GlobalStylesRecord >;
	logoBeforeUpdate?: SiteLogo;
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

	const themeBeforeUpdate = captureThemeSnapshot();
	const logoBeforeUpdate = keys.includes( checkpointKeys.LOGO ) ? getSiteLogo() : undefined;

	records.set( id, {
		...metadata,
		id,
		checkpointKeys: keys,
		createdAt: Date.now(),
		...( themeBeforeUpdate && { themeBeforeUpdate } ),
		...( logoBeforeUpdate !== undefined && { logoBeforeUpdate } ),
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
	write: () => T | Promise< T >
): Promise< T > {
	const callId = toolCallId ?? getToolCallIdFromConversationHistory( toolId );
	const checkpointId = callId && ! hasCheckpoint( callId ) ? callId : null;

	if ( checkpointId ) {
		setCheckpoint( checkpointId, keys, { toolId, summary } );
	}

	try {
		return await write();
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
