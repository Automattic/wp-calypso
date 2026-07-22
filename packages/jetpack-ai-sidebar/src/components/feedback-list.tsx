/**
 * FeedbackList - shared renderer for flat, item-based review flows.
 *
 * Both the Generate Feedback (PostFeedback) and Proofreader (Proofread) flows
 * present the same thing: a summary plus a list of items, each with short
 * feedback, an action, and an optional one-click rewrite when the item has
 * exact source text. This component owns that shared behaviour - the item
 * status machine, apply/undo/dismiss, block focus, and stale-context handling
 * - and takes the per-flow copy and options (summary notes, bulk "Apply all")
 * as props so each flow stays a thin wrapper.
 *
 * Cards resolve into two families by whether the edit can be applied in place:
 * applicable cards show a Current/New diff and "Apply change"; advisory
 * ("Manual edit") cards show a Why/Suggestion body and "Go to section" instead
 * of a dead Apply. Applied and Dismissed keep the header and collapse the body
 * to an undoable resolution row.
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
import {
	countOccurrences,
	flattenBlocks,
	getEditorContentBlocks,
	type BlockEditorStore,
	type EditorStore,
} from '../utils/blocks';
import { useCopyToClipboard } from '../utils/use-copy-to-clipboard';
import { type BlockSnapshot } from './block-ref';
import ReviewCard, { type ReviewCardRow } from './review-card';

export interface FeedbackListItem {
	title: string;
	feedback: string;
	action: string;
	block_index: number | null;
	editable_attribute?: string;
	current_text?: string;
	current_text_html?: string;
	suggested_text?: string;
	suggested_text_html?: string;
	requires_manual?: boolean;
	manual_reason?: string;
}

export interface FeedbackListSection {
	title: string;
	items: FeedbackListItem[];
}

interface SummaryNote {
	text: string;
	/** BEM element suffix for the note's class, e.g. `completed-note`. */
	modifier: string;
}

/** Root class name; prefixes every class this component renders. */
const CLASS_PREFIX = 'jetpack-ai-feedback-list';

export type EditorPostId = number | string;

/**
 * Per-flow copy and options. The data props (summary/items/sections/postId)
 * come from the show-component payload; everything here is flow configuration.
 */
export interface FeedbackListProps {
	summary: string;
	items?: FeedbackListItem[];
	sections?: FeedbackListSection[];
	postId?: EditorPostId;
	/** Title used when the flow provides flat items rather than sections. */
	sectionFallbackTitle: string;
	/** Warning shown when the reviewed post no longer matches the editor. */
	staleWarning: string;
	/** Message shown when applying an item fails. */
	failureMessage: string;
	/** Extra notes rendered under the summary, each with its own class. */
	summaryNotes?: SummaryNote[];
	/** When true, render an "Apply all" footer over one-click items. */
	enableBulkApply?: boolean;
}

type ItemStatus = 'pending' | 'applying' | 'accepted' | 'dismissed' | 'failed';

interface EditSnapshot {
	clientId: string;
	contentBefore: string;
	contentAfter: string;
	editableAttribute?: string;
}

type WpCurrentPostStore = { getCurrentPostId?: () => EditorPostId | null };
type WpDataWindow = {
	wp?: {
		data?: {
			select?: ( store: string ) => WpCurrentPostStore | undefined;
		};
	};
};

function normalizeEditorPostId( postId: unknown ): EditorPostId | undefined {
	if ( typeof postId === 'number' && postId > 0 ) {
		return postId;
	}
	if ( typeof postId === 'string' && postId.trim() ) {
		return postId;
	}
	return undefined;
}

function getCurrentEditorPostIdFromStore(): EditorPostId | undefined {
	try {
		const postId = ( window as unknown as WpDataWindow ).wp?.data
			?.select?.( 'core/editor' )
			?.getCurrentPostId?.();
		return normalizeEditorPostId( postId );
	} catch {
		return undefined;
	}
}

function getItemKey( sectionIndex: number, itemIndex: number ): string {
	return `${ sectionIndex }:${ itemIndex }`;
}

function normaliseSections(
	fallbackTitle: string,
	items?: FeedbackListItem[],
	sections?: FeedbackListSection[]
) {
	if ( Array.isArray( sections ) && sections.length > 0 ) {
		return sections;
	}
	if ( Array.isArray( items ) && items.length > 0 ) {
		return [
			{
				title: fallbackTitle,
				items,
			},
		];
	}
	return [];
}

function getApplyUnavailableReason(
	item: FeedbackListItem,
	block: BlockSnapshot | null
): string | undefined {
	if ( item.requires_manual ) {
		return (
			item.manual_reason || __( 'This item cannot be applied automatically.', __i18n_text_domain__ )
		);
	}
	if ( ! item.suggested_text ) {
		return __( 'Needs manual edit - no rewrite was generated.', __i18n_text_domain__ );
	}
	if ( item.block_index === null || item.block_index === undefined ) {
		return __( 'Needs manual edit - no exact block target.', __i18n_text_domain__ );
	}
	if ( ! block ) {
		return __( 'Needs manual edit - source block changed.', __i18n_text_domain__ );
	}
	if ( ! item.current_text ) {
		return __( 'Needs manual edit - no exact source text.', __i18n_text_domain__ );
	}
	if ( ! hasEditableBlockTarget( block, item.editable_attribute, item.current_text ) ) {
		return __( 'Needs manual edit - unsupported edit target.', __i18n_text_domain__ );
	}

	const occurrences = countOccurrences(
		getEditableBlockContent( block, item.editable_attribute, item.current_text ),
		item.current_text
	);
	if ( occurrences === 0 ) {
		return __( 'Needs manual edit - source text changed.', __i18n_text_domain__ );
	}
	if ( occurrences > 1 ) {
		return __( 'Needs manual edit - source text appears more than once.', __i18n_text_domain__ );
	}
	return undefined;
}

/**
 * Render a flat, item-based feedback list.
 * @param {FeedbackListProps} props Component props.
 * @returns React element.
 */
export default function FeedbackList( {
	summary,
	items,
	sections,
	postId,
	sectionFallbackTitle,
	staleWarning,
	failureMessage,
	summaryNotes,
	enableBulkApply = false,
}: FeedbackListProps ) {
	const [ itemStatuses, setItemStatuses ] = useState< Record< string, ItemStatus > >( {} );
	const [ bulkRunning, setBulkRunning ] = useState( false );
	// Only one item shows "Copied" at a time; the shared hook owns that state.
	const { clipboardSupported, copiedKey, copy: copyItem } = useCopyToClipboard();
	const editSnapshots = useRef< Record< string, EditSnapshot > >( {} );

	const blocks = useSelect(
		( select ) =>
			getEditorContentBlocks(
				select( 'core/block-editor' ) as BlockEditorStore,
				select( 'core/editor' ) as EditorStore
			),
		[]
	);
	const currentPostId = useSelect(
		( select ) =>
			normalizeEditorPostId(
				( select( 'core/editor' ) as WpCurrentPostStore )?.getCurrentPostId?.()
			),
		[]
	);
	const flatBlocks = useMemo( () => flattenBlocks( blocks ), [ blocks ] );
	const feedbackSections = useMemo(
		() => normaliseSections( sectionFallbackTitle, items, sections ),
		[ sectionFallbackTitle, items, sections ]
	);
	const isPostStale = ! postId || ! currentPostId || String( postId ) !== String( currentPostId );
	const isLatestPostContextStale = useCallback( () => {
		const latestCurrentPostId = getCurrentEditorPostIdFromStore() ?? currentPostId;
		return ! postId || ! latestCurrentPostId || String( postId ) !== String( latestCurrentPostId );
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
		async ( item: FeedbackListItem, sectionIndex: number, itemIndex: number ) => {
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

	// Pending, one-click-applicable items, used for the "Apply all" action.
	const applyAllTargets = useMemo( () => {
		if ( ! enableBulkApply || isPostStale ) {
			return [] as Array< { item: FeedbackListItem; sectionIndex: number; itemIndex: number } >;
		}
		const targets: Array< { item: FeedbackListItem; sectionIndex: number; itemIndex: number } > =
			[];
		feedbackSections.forEach( ( section, sectionIndex ) => {
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
	}, [ enableBulkApply, flatBlocks, isPostStale, itemStatuses, feedbackSections ] );

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
			className={ `${ CLASS_PREFIX }${ isPostStale ? ' is-post-stale' : '' }` }
			onMouseDownCapture={ handleRootMouseDown }
		>
			{ isPostStale && (
				<p className={ `${ CLASS_PREFIX }__stale-warning` } role="note">
					{ staleWarning }
				</p>
			) }
			<Panel className={ `${ CLASS_PREFIX }__panel` }>
				<PanelBody
					title={ __( 'Summary', __i18n_text_domain__ ) }
					className={ `${ CLASS_PREFIX }__summary` }
					initialOpen
				>
					<p>{ summary }</p>
					{ summaryNotes?.map( ( note ) => (
						<p key={ note.modifier } className={ `${ CLASS_PREFIX }__${ note.modifier }` }>
							{ note.text }
						</p>
					) ) }
				</PanelBody>
				{ feedbackSections.map( ( section, sectionIndex ) => (
					<PanelBody
						key={ `${ section.title }:${ sectionIndex }` }
						title={ sprintf(
							/* translators: 1: section label, 2: number of suggestions. */
							__( '%1$s (%2$d)', __i18n_text_domain__ ),
							section.title,
							section.items.length
						) }
						initialOpen
					>
						<div className={ `${ CLASS_PREFIX }__items` }>
							{ section.items.map( ( item, itemIndex ) => {
								const key = getItemKey( sectionIndex, itemIndex );
								const status = itemStatuses[ key ] ?? 'pending';
								const block = item.block_index === null ? null : flatBlocks[ item.block_index ];
								// Item-level reason it can't be applied (backend flag or drift) — not the stale
								// state, whose block refs point at the wrong post.
								const itemManualReason = getApplyUnavailableReason( item, block );
								const canApply = ! isPostStale && ! itemManualReason;
								// Keep Apply while an apply is in flight, unless the post went stale mid-apply.
								const showApply = canApply || ( ! isPostStale && status === 'applying' );
								// Manual tag: always for a backend-manual item; a frontend reason only when fresh.
								const isManualEdit =
									!! item.requires_manual || ( ! isPostStale && !! itemManualReason );
								// Show the diff only while the exact source text is still present in the post.
								const currentTextPresent =
									!! item.current_text &&
									!! block &&
									countOccurrences(
										getEditableBlockContent( block, item.editable_attribute, item.current_text ),
										item.current_text
									) >= 1;
								const showDiff = currentTextPresent && !! item.suggested_text;
								const suggestionText = item.suggested_text || item.action;
								const canGoToSection =
									!! focusCurrentPostBlock &&
									item.block_index !== null &&
									item.block_index !== undefined &&
									item.block_index >= 0 &&
									item.block_index < flatBlocks.length;

								const categoryBadge = sprintf(
									/* translators: 1: issue category, 2: position in the run, 3: total suggestions. */
									__( '%1$s (%2$d/%3$d)', __i18n_text_domain__ ),
									item.title,
									itemIndex + 1,
									section.items.length
								);
								// Why leads the body; it falls back to manual_reason since the reason note only
								// carries the frontend can't-apply cause.
								const feedbackReason = item.feedback || item.manual_reason;
								const bodyRows: ReviewCardRow[] = [];
								if ( feedbackReason ) {
									bodyRows.push( {
										tag: __( 'Why', __i18n_text_domain__ ),
										text: feedbackReason,
										variant: 'current',
										element: 'text',
									} );
								}
								if ( showDiff ) {
									bodyRows.push( {
										tag: __( 'Current', __i18n_text_domain__ ),
										text: item.current_text ?? '',
										previewHtml: item.current_text_html,
										variant: 'current',
										element: 'del',
									} );
									bodyRows.push( {
										tag: __( 'New', __i18n_text_domain__ ),
										text: item.suggested_text ?? '',
										previewHtml: item.suggested_text_html,
										variant: 'new',
										element: 'ins',
									} );
								} else if ( suggestionText ) {
									bodyRows.push( {
										tag: __( 'Suggestion', __i18n_text_domain__ ),
										text: suggestionText,
										previewHtml: item.suggested_text ? item.suggested_text_html : undefined,
										variant: 'new',
										element: 'text',
									} );
								}

								return (
									<ReviewCard
										key={ key }
										model={ {
											badge: categoryBadge,
											isManualEdit,
											blockIndex: item.block_index,
											bodyRows,
											reasonNote:
												isPostStale || item.requires_manual ? undefined : itemManualReason,
										} }
										blocks={ flatBlocks }
										status={ status }
										showApply={ showApply }
										canGoToSection={ canGoToSection }
										showCopy={ !! suggestionText && clipboardSupported }
										copied={ copiedKey === key }
										disabled={ isPostStale || bulkRunning }
										failureMessage={ failureMessage }
										onApply={ () => applyItem( item, sectionIndex, itemIndex ) }
										onGoToSection={ () => {
											if ( item.block_index !== null && item.block_index !== undefined ) {
												focusBlock( item.block_index );
											}
										} }
										onCopy={ () => {
											if ( suggestionText ) {
												copyItem( key, suggestionText );
											}
										} }
										onDismiss={ () => dismissItem( key ) }
										onUndo={ () => undoItem( key ) }
										onFocusBlock={ focusCurrentPostBlock }
									/>
								);
							} ) }
						</div>
					</PanelBody>
				) ) }
			</Panel>
			{ enableBulkApply && ( bulkRunning || applyAllTargets.length > 0 ) && (
				<footer className={ `${ CLASS_PREFIX }__footer` }>
					<button
						type="button"
						className={ `${ CLASS_PREFIX }__footer-action is-accept` }
						onClick={ applyAll }
						disabled={ isPostStale || bulkRunning || applyAllTargets.length === 0 }
					>
						{ bulkRunning
							? __( 'Applying…', __i18n_text_domain__ )
							: sprintf(
									/* translators: %d is the number of one-click fixes available. */
									__( 'Apply all (%d)', __i18n_text_domain__ ),
									applyAllTargets.length
							  ) }
					</button>
				</footer>
			) }
		</div>
	);
}
