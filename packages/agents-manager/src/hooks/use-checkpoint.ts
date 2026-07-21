import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { doAction } from '@wordpress/hooks';
import { TemplatePartSlug } from '../utils/template-parts';
import { unlock } from '../utils/unlock-private-apis';
import useTemplateParts from './use-template-parts';

export const CHECKPOINT_RESTORED_ACTION = 'agents-manager.checkpoint-restored';

interface BlockSnapshot {
	contentBlocks: unknown[];
	headerBlocks: unknown[];
	headerHeroBlocks: unknown[];
	footerBlocks: unknown[];
}

/**
 * Editor state snapshot stored at each checkpoint by `useCheckpoint`.
 */
interface CheckpointState {
	checkpointKeys: string[];
	globalStylesSettings?: Record< string, unknown >;
	globalStylesStyles?: Record< string, unknown >;
	blocks?: BlockSnapshot;
	[ key: string ]: unknown;
}

/**
 * Return type of the `useCheckpoint` hook.
 */
export interface UseCheckpointReturn {
	setCheckpoint: ( id: string, keys?: string[] ) => void;
	restoreCheckpoint: ( id: string ) => Promise< void >;
	hasCheckpoint: ( id: string ) => boolean;
}

// Module-scoped so all callers share the same checkpoint store.
const sharedCheckpoints = new Map< string, CheckpointState >();

/**
 * Saves and restores editor state snapshots (global styles + blocks) so that
 * AI actions can be undone.
 */
export default function useCheckpoint(): UseCheckpointReturn {
	const { globalStylesId, getEditedEntityRecord } = useSelect( ( select ) => {
		const core = select( coreStore ) as {
			__experimentalGetCurrentGlobalStylesId: () => string;
			getEditedEntityRecord: (
				kind: string,
				name: string,
				key: string
			) => Record< string, unknown >;
		};
		return {
			globalStylesId: core.__experimentalGetCurrentGlobalStylesId(),
			getEditedEntityRecord: core.getEditedEntityRecord,
		};
	}, [] );

	const blockEditorSelector = useSelect( ( select ) => select( blockEditorStore ), [] );
	const { getBlocks, getBlocksByName, getBlock } = blockEditorSelector as {
		getBlocks: ( rootClientId?: string ) => unknown[];
		getBlocksByName: ( name: string ) => string[];
		getBlock: ( clientId: string ) => { attributes?: { slug?: string } } | null;
	};
	const { getSectionRootClientId } = unlock( blockEditorSelector ) as {
		getSectionRootClientId: () => string;
	};

	const { editEntityRecord } = useDispatch( coreStore );
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );
	const { replaceTemplatePart } = useTemplateParts();

	/** Deep-clone the blocks under `rootClientId`. Returns `[]` if not found. */
	const cloneBlocks = useCallback(
		( rootClientId: string | undefined ): unknown[] => {
			if ( ! rootClientId ) {
				return [];
			}
			return JSON.parse( JSON.stringify( getBlocks( rootClientId ) ) );
		},
		[ getBlocks ]
	);

	/** Find the `clientId` of a `core/template-part` block by its slug (searches full tree). */
	const findTemplatePart = useCallback(
		( slug: string ): string | undefined => {
			return getBlocksByName( 'core/template-part' ).find(
				( clientId ) => getBlock( clientId )?.attributes?.slug === slug
			);
		},
		[ getBlocksByName, getBlock ]
	);

	/** Snapshot the current block state (content + template parts). */
	const snapshotBlocks = useCallback( (): BlockSnapshot => {
		return {
			contentBlocks: cloneBlocks( getSectionRootClientId() ),
			headerBlocks: cloneBlocks( findTemplatePart( TemplatePartSlug.Header ) ),
			headerHeroBlocks: cloneBlocks( findTemplatePart( TemplatePartSlug.HeaderHero ) ),
			footerBlocks: cloneBlocks( findTemplatePart( TemplatePartSlug.Footer ) ),
		};
	}, [ cloneBlocks, getSectionRootClientId, findTemplatePart ] );

	const setCheckpoint = useCallback(
		( id: string, keys: string[] = [] ) => {
			if ( ! id || ! globalStylesId ) {
				return;
			}
			const record = getEditedEntityRecord( 'root', 'globalStyles', globalStylesId );
			const copy = record ? JSON.parse( JSON.stringify( record ) ) : {};
			sharedCheckpoints.set( id, {
				checkpointKeys: keys,
				globalStylesSettings: copy.settings,
				globalStylesStyles: copy.styles,
				blocks: snapshotBlocks(),
			} );
		},
		[ globalStylesId, getEditedEntityRecord, snapshotBlocks ]
	);

	const restoreCheckpoint = useCallback(
		async ( id: string ) => {
			const state = sharedCheckpoints.get( id );
			if ( ! state || ! globalStylesId ) {
				return;
			}

			// Page-level operations require `usePages` (not yet decoupled).
			// Skip restoration to avoid applying block/style changes to the wrong page.
			if ( state.newPageId || state.pageRemoval ) {
				return;
			}

			// Restore global styles.
			if ( state.globalStylesSettings || state.globalStylesStyles ) {
				await editEntityRecord( 'root', 'globalStyles', globalStylesId, {
					settings: state.globalStylesSettings || {},
					styles: state.globalStylesStyles || {},
				} );
			}

			// Restore blocks (content + template parts).
			if ( state.blocks ) {
				replaceTemplatePart( TemplatePartSlug.Header, state.blocks.headerBlocks );
				// Await `HeaderHero` because its client IDs change and affect subsequent operations.
				await replaceTemplatePart( TemplatePartSlug.HeaderHero, state.blocks.headerHeroBlocks );
				replaceTemplatePart( TemplatePartSlug.Footer, state.blocks.footerBlocks );
				replaceInnerBlocks( getSectionRootClientId(), state.blocks.contentBlocks );
			}

			doAction( CHECKPOINT_RESTORED_ACTION );
		},
		[
			globalStylesId,
			editEntityRecord,
			replaceTemplatePart,
			replaceInnerBlocks,
			getSectionRootClientId,
		]
	);

	const hasCheckpoint = useCallback(
		( id: string ) => !! sharedCheckpoints.get( id )?.checkpointKeys?.length,
		[]
	);

	return {
		setCheckpoint,
		restoreCheckpoint,
		hasCheckpoint,
	};
}
