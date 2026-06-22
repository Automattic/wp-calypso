/**
 * Proofread - renderer for the Proofreader (spelling & grammar) flow.
 *
 * Mirrors the Generate Feedback (PostFeedback) structure - flat items with
 * one-click rewrites when an item has exact source text - and adds an
 * "Accept all" action plus a saved-version note in the summary.
 */

/**
 * External dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import {
	applyReviewEdit,
	clearActiveBlockFocus,
	clearActiveBlockFocusUnlessBlockReferenceClick,
	getEditableBlockContent,
	hasEditableBlockTarget,
	toggleBlockReferenceFocus,
	undoBlockEdit,
} from '../utils/block-actions';
import BlockRef, { type BlockSnapshot } from './block-ref';

interface ProofreadItem {
	title: string;
	feedback: string;
	action: string;
	block_index: number | null;
	editable_attribute?: string;
	current_text?: string;
	suggested_text?: string;
	requires_manual?: boolean;
	manual_reason?: string;
}

interface ProofreadSection {
	title: string;
	items: ProofreadItem[];
}

export interface ProofreadProps {
	summary: string;
	items?: ProofreadItem[];
	sections?: ProofreadSection[];
	postId?: number;
}

type ItemStatus = 'pending' | 'applying' | 'accepted' | 'dismissed' | 'failed';

interface EditSnapshot {
	clientId: string;
	contentBefore: string;
	contentAfter: string;
	editableAttribute?: string;
}

type WpCurrentPostStore = { getCurrentPostId?: () => number | null };
type WpDataWindow = {
	wp?: {
		data?: {
			select?: ( store: string ) => WpCurrentPostStore | undefined;
		};
	};
};

function getCurrentEditorPostIdFromStore(): number | undefined {
	try {
		const postId = ( window as unknown as WpDataWindow ).wp?.data
			?.select?.( 'core/editor' )
			?.getCurrentPostId?.();
		return typeof postId === 'number' && postId > 0 ? postId : undefined;
	} catch {
		return undefined;
	}
}

function flattenBlocks( blocks: BlockSnapshot[] ): BlockSnapshot[] {
	const out: BlockSnapshot[] = [];
	const walk = ( items: BlockSnapshot[] ) => {
		items.forEach( ( block ) => {
			if ( ! block.name ) {
				return;
			}
			out.push( block );
			if ( Array.isArray( block.innerBlocks ) && block.innerBlocks.length > 0 ) {
				walk( block.innerBlocks );
			}
		} );
	};
	walk( blocks );
	return out;
}

function countOccurrences( source: string, needle: string ): number {
	if ( needle === '' ) {
		return 0;
	}
	let count = 0;
	let pos = 0;
	while ( true ) {
		const found = source.indexOf( needle, pos );
		if ( found === -1 ) {
			return count;
		}
		count++;
		pos = found + 1;
	}
}

function getItemKey( sectionIndex: number, itemIndex: number ): string {
	return `${ sectionIndex }:${ itemIndex }`;
}

function getItemReasonId( sectionIndex: number, itemIndex: number ): string {
	return `jetpack-ai-proofread-reason-${ sectionIndex }-${ itemIndex }`;
}

function normaliseSections( items?: ProofreadItem[], sections?: ProofreadSection[] ) {
	if ( Array.isArray( sections ) && sections.length > 0 ) {
		return sections;
	}
	if ( Array.isArray( items ) && items.length > 0 ) {
		return [
			{
				title: __( 'Spelling & grammar', 'jetpack' ),
				items,
			},
		];
	}
	return [];
}

function getApplyUnavailableReason(
	item: ProofreadItem,
	block: BlockSnapshot | null
): string | undefined {
	if ( item.requires_manual ) {
		return item.manual_reason || __( 'This item cannot be applied automatically.', 'jetpack' );
	}
	if ( ! item.suggested_text ) {
		return __( 'Needs manual edit - no rewrite was generated.', 'jetpack' );
	}
	if ( item.block_index === null || item.block_index === undefined ) {
		return __( 'Needs manual edit - no exact block target.', 'jetpack' );
	}
	if ( ! block ) {
		return __( 'Needs manual edit - source block changed.', 'jetpack' );
	}
	if ( ! item.current_text ) {
		return __( 'Needs manual edit - no exact source text.', 'jetpack' );
	}
	if ( ! hasEditableBlockTarget( block, item.editable_attribute, item.current_text ) ) {
		return __( 'Needs manual edit - unsupported edit target.', 'jetpack' );
	}

	const occurrences = countOccurrences(
		getEditableBlockContent( block, item.editable_attribute, item.current_text ),
		item.current_text
	);
	if ( occurrences === 0 ) {
		return __( 'Needs manual edit - source text changed.', 'jetpack' );
	}
	if ( occurrences > 1 ) {
		return __( 'Needs manual edit - source text appears more than once.', 'jetpack' );
	}
	return undefined;
}

function getApplyLabel( status: ItemStatus ): string {
	switch ( status ) {
		case 'applying':
			return __( 'Accepting…', 'jetpack' );
		case 'accepted':
			return __( 'Accepted', 'jetpack' );
		case 'failed':
			return __( 'Retry', 'jetpack' );
		default:
			return __( 'Accept', 'jetpack' );
	}
}

function getUnavailableMessage( item: ProofreadItem, reason: string ): string {
	if ( item.requires_manual ) {
		return `${ __( 'Needs manual edit:', 'jetpack' ) } ${ reason }`;
	}
	return reason;
}

/**
 * Render the proofreader component.
 * @param {ProofreadProps} props Component props.
 * @returns React element.
 */
export default function Proofread( { summary, items, sections, postId }: ProofreadProps ) {
	const [ itemStatuses, setItemStatuses ] = useState< Record< string, ItemStatus > >( {} );
	const [ bulkRunning, setBulkRunning ] = useState( false );
	const editSnapshots = useRef< Record< string, EditSnapshot > >( {} );

	const blocks = useSelect(
		( select ) =>
			( select( 'core/block-editor' ) as { getBlocks?: () => BlockSnapshot[] } )?.getBlocks?.() ??
			[],
		[]
	);
	const currentPostId = useSelect(
		( select ) =>
			( select( 'core/editor' ) as WpCurrentPostStore )?.getCurrentPostId?.() ?? undefined,
		[]
	);
	const flatBlocks = useMemo( () => flattenBlocks( blocks ), [ blocks ] );
	const proofreadSections = useMemo(
		() => normaliseSections( items, sections ),
		[ items, sections ]
	);
	const isPostStale = ! postId || ! currentPostId || postId !== currentPostId;
	const isLatestPostContextStale = useCallback( () => {
		const latestCurrentPostId = getCurrentEditorPostIdFromStore() ?? currentPostId;
		return ! postId || ! latestCurrentPostId || postId !== latestCurrentPostId;
	}, [ currentPostId, postId ] );
	const setItemStatus = useCallback( ( key: string, status: ItemStatus ) => {
		setItemStatuses( ( prev ) => ( { ...prev, [ key ]: status } ) );
	}, [] );

	const focusBlock = useCallback(
		( index: number ) => {
			const clientId = flatBlocks[ index ]?.clientId;
			if ( ! clientId ) {
				return;
			}
			toggleBlockReferenceFocus( clientId );
		},
		[ flatBlocks ]
	);
	const focusCurrentPostBlock = isPostStale ? undefined : focusBlock;

	const handleRootMouseDown = useCallback( ( event: { target: EventTarget | null } ) => {
		clearActiveBlockFocusUnlessBlockReferenceClick( event.target );
	}, [] );

	useEffect( () => {
		return () => {
			clearActiveBlockFocus();
		};
	}, [] );

	const applyItem = useCallback(
		async ( item: ProofreadItem, sectionIndex: number, itemIndex: number ) => {
			const key = getItemKey( sectionIndex, itemIndex );
			const block = item.block_index === null ? null : flatBlocks[ item.block_index ];
			if ( isLatestPostContextStale() || getApplyUnavailableReason( item, block ) ) {
				setItemStatus( key, 'failed' );
				return;
			}

			setItemStatus( key, 'applying' );
			const clientId = block?.clientId;
			if ( ! clientId || ! item.suggested_text ) {
				setItemStatus( key, 'failed' );
				return;
			}

			let result: Awaited< ReturnType< typeof applyReviewEdit > >;
			try {
				result = await applyReviewEdit(
					clientId,
					item.suggested_text,
					undefined,
					item.current_text,
					() => ! isLatestPostContextStale(),
					item.editable_attribute
				);
			} catch {
				setItemStatus( key, 'failed' );
				return;
			}

			if (
				result.success &&
				result.clientId &&
				typeof result.contentBefore === 'string' &&
				typeof result.contentAfter === 'string'
			) {
				editSnapshots.current[ key ] = {
					clientId: result.clientId,
					contentBefore: result.contentBefore,
					contentAfter: result.contentAfter,
					editableAttribute: result.editableAttribute,
				};
				setItemStatus( key, 'accepted' );
				return;
			}

			setItemStatus( key, 'failed' );
		},
		[ flatBlocks, isLatestPostContextStale, setItemStatus ]
	);

	// Pending, one-click-applicable items, used for the "Accept all" action.
	const applyAllTargets = useMemo( () => {
		if ( isPostStale ) {
			return [] as Array< { item: ProofreadItem; sectionIndex: number; itemIndex: number } >;
		}
		const targets: Array< { item: ProofreadItem; sectionIndex: number; itemIndex: number } > = [];
		proofreadSections.forEach( ( section, sectionIndex ) => {
			section.items.forEach( ( item, itemIndex ) => {
				const status = itemStatuses[ getItemKey( sectionIndex, itemIndex ) ] ?? 'pending';
				if ( status !== 'pending' && status !== 'failed' ) {
					return;
				}
				const block = item.block_index === null ? null : flatBlocks[ item.block_index ];
				if ( getApplyUnavailableReason( item, block ) ) {
					return;
				}
				targets.push( { item, sectionIndex, itemIndex } );
			} );
		} );
		return targets;
	}, [ flatBlocks, isPostStale, itemStatuses, proofreadSections ] );

	const applyAll = useCallback( async () => {
		if ( bulkRunning || isLatestPostContextStale() ) {
			return;
		}
		setBulkRunning( true );
		for ( const target of applyAllTargets ) {
			// Apply sequentially so each edit validates against the live block.
			// eslint-disable-next-line no-await-in-loop
			await applyItem( target.item, target.sectionIndex, target.itemIndex );
		}
		setBulkRunning( false );
	}, [ applyAllTargets, applyItem, bulkRunning, isLatestPostContextStale ] );

	const undoItem = useCallback(
		( key: string ) => {
			if ( isLatestPostContextStale() ) {
				return;
			}
			const snapshot = editSnapshots.current[ key ];
			if ( snapshot ) {
				const didUndo = undoBlockEdit(
					snapshot.clientId,
					snapshot.contentBefore,
					snapshot.contentAfter,
					snapshot.editableAttribute
				);
				if ( ! didUndo ) {
					setItemStatus( key, 'failed' );
					return;
				}
				delete editSnapshots.current[ key ];
			}
			setItemStatus( key, 'pending' );
		},
		[ isLatestPostContextStale, setItemStatus ]
	);

	const dismissItem = useCallback(
		( key: string ) => {
			if ( ! isPostStale ) {
				setItemStatus( key, 'dismissed' );
			}
		},
		[ isPostStale, setItemStatus ]
	);

	return (
		<div
			className={ `jetpack-ai-proofread${ isPostStale ? ' is-post-stale' : '' }` }
			onMouseDownCapture={ handleRootMouseDown }
		>
			{ isPostStale && (
				<p className="jetpack-ai-proofread__stale-warning" role="note">
					{ __(
						'Review context changed. Run the spelling and grammar check again for this post.',
						'jetpack'
					) }
				</p>
			) }
			<Panel className="jetpack-ai-proofread__panel">
				<PanelBody
					title={ __( 'Summary', 'jetpack' ) }
					className="jetpack-ai-proofread__summary"
					initialOpen
				>
					<p>{ summary }</p>
					<p className="jetpack-ai-proofread__completed-note">
						{ __( 'Spelling and grammar check complete.', 'jetpack' ) }
					</p>
					<p className="jetpack-ai-proofread__saved-note">
						{ __( 'Reviews your last saved version.', 'jetpack' ) }
					</p>
				</PanelBody>
				{ proofreadSections.map( ( section, sectionIndex ) => (
					<PanelBody
						key={ `${ section.title }:${ sectionIndex }` }
						title={ section.title }
						initialOpen
					>
						<div className="jetpack-ai-proofread__items">
							{ section.items.map( ( item, itemIndex ) => {
								const key = getItemKey( sectionIndex, itemIndex );
								const status = itemStatuses[ key ] ?? 'pending';
								const isCollapsed = status === 'accepted' || status === 'dismissed';
								const block = item.block_index === null ? null : flatBlocks[ item.block_index ];
								const applyUnavailableReason = isPostStale
									? __( 'Run the check again for this post.', 'jetpack' )
									: getApplyUnavailableReason( item, block );
								const isApplyUnavailable = !! applyUnavailableReason;
								const applyUnavailableReasonId = getItemReasonId( sectionIndex, itemIndex );

								if ( isCollapsed ) {
									return (
										<div
											key={ key }
											className={ `jetpack-ai-proofread__item is-collapsed is-${ status }` }
										>
											<span className="jetpack-ai-proofread__collapsed-status">
												{ status === 'accepted'
													? __( 'Applied', 'jetpack' )
													: __( 'Dismissed', 'jetpack' ) }
											</span>
											<span className="jetpack-ai-proofread__collapsed-title">{ item.title }</span>
											<button
												type="button"
												className="jetpack-ai-proofread__small-action"
												onClick={ () => undoItem( key ) }
												disabled={ isPostStale }
											>
												{ __( 'Undo', 'jetpack' ) }
											</button>
										</div>
									);
								}

								return (
									<div key={ key } className={ `jetpack-ai-proofread__item is-${ status }` }>
										<div className="jetpack-ai-proofread__item-header">
											<h4 className="jetpack-ai-proofread__item-title">{ item.title }</h4>
											<BlockRef
												index={ item.block_index }
												blocks={ flatBlocks }
												onFocus={ focusCurrentPostBlock }
												className="jetpack-ai-proofread__block-ref"
											/>
										</div>
										<p className="jetpack-ai-proofread__feedback">{ item.feedback }</p>
										<p className="jetpack-ai-proofread__action">{ item.action }</p>
										{ item.current_text && item.suggested_text && (
											<div className="jetpack-ai-proofread__rewrite">
												<p className="jetpack-ai-proofread__rewrite-label">
													{ __( 'Suggested fix', 'jetpack' ) }
												</p>
												<del>{ item.current_text }</del>
												<ins>{ item.suggested_text }</ins>
											</div>
										) }
										{ applyUnavailableReason && (
											<p
												id={ applyUnavailableReasonId }
												className="jetpack-ai-proofread__manual-reason"
											>
												{ isPostStale
													? applyUnavailableReason
													: getUnavailableMessage( item, applyUnavailableReason ) }
											</p>
										) }
										<div className="jetpack-ai-proofread__actions">
											<button
												type="button"
												className="jetpack-ai-proofread__action-button is-primary"
												onClick={ () => applyItem( item, sectionIndex, itemIndex ) }
												disabled={
													isPostStale || bulkRunning || status === 'applying' || isApplyUnavailable
												}
												aria-describedby={
													isApplyUnavailable ? applyUnavailableReasonId : undefined
												}
											>
												{ getApplyLabel( status ) }
											</button>
											<button
												type="button"
												className="jetpack-ai-proofread__action-button"
												onClick={ () => dismissItem( key ) }
												disabled={ isPostStale || bulkRunning || status === 'applying' }
											>
												{ __( 'Dismiss', 'jetpack' ) }
											</button>
										</div>
										{ status === 'failed' && (
											<p className="jetpack-ai-proofread__status is-failed">
												{ __(
													'Could not apply this fix. Check the text and try again.',
													'jetpack'
												) }
											</p>
										) }
									</div>
								);
							} ) }
						</div>
					</PanelBody>
				) ) }
			</Panel>
			{ applyAllTargets.length > 0 && (
				<footer className="jetpack-ai-proofread__footer">
					<button
						type="button"
						className="jetpack-ai-proofread__footer-action is-accept"
						onClick={ applyAll }
						disabled={ isPostStale || bulkRunning || applyAllTargets.length === 0 }
					>
						{ sprintf(
							/* translators: %d is the number of one-click fixes available. */
							__( 'Accept all (%d)', 'jetpack' ),
							applyAllTargets.length
						) }
					</button>
				</footer>
			) }
		</div>
	);
}
