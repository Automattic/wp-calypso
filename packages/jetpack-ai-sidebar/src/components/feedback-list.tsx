/**
 * FeedbackList - shared renderer for flat, item-based review flows.
 *
 * Both the Generate Feedback (PostFeedback) and Proofreader (Proofread) flows
 * present the same thing: a summary plus a list of items, each with short
 * feedback, an action, and an optional one-click rewrite when the item has
 * exact source text. This component owns that shared behaviour - the item
 * status machine, apply/undo/dismiss, block focus, and stale-context handling
 * - and takes the per-flow copy and options (summary notes, bulk "Accept all")
 * as props so each flow stays a thin wrapper.
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
import BlockRef, { type BlockSnapshot } from './block-ref';

export interface FeedbackListItem {
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
	/** Label shown above a suggested rewrite, e.g. "Suggested rewrite". */
	rewriteLabel: string;
	/** Warning shown when the reviewed post no longer matches the editor. */
	staleWarning: string;
	/** Per-item apply reason shown when the post context is stale. */
	staleApplyReason: string;
	/** Message shown when applying an item fails. */
	failureMessage: string;
	/** Extra notes rendered under the summary, each with its own class. */
	summaryNotes?: SummaryNote[];
	/** When true, render an "Accept all" footer over one-click items. */
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

function getItemReasonId( sectionIndex: number, itemIndex: number ): string {
	return `${ CLASS_PREFIX }-reason-${ sectionIndex }-${ itemIndex }`;
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

function getApplyLabel( status: ItemStatus ): string {
	switch ( status ) {
		case 'applying':
			return __( 'Accepting…', __i18n_text_domain__ );
		case 'accepted':
			return __( 'Accepted', __i18n_text_domain__ );
		case 'failed':
			return __( 'Retry', __i18n_text_domain__ );
		default:
			return __( 'Accept', __i18n_text_domain__ );
	}
}

function getUnavailableMessage( item: FeedbackListItem, reason: string ): string {
	if ( item.requires_manual ) {
		return `${ __( 'Needs manual edit:', __i18n_text_domain__ ) } ${ reason }`;
	}
	return reason;
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
	rewriteLabel,
	staleWarning,
	staleApplyReason,
	failureMessage,
	summaryNotes,
	enableBulkApply = false,
}: FeedbackListProps ) {
	const [ itemStatuses, setItemStatuses ] = useState< Record< string, ItemStatus > >( {} );
	const [ bulkRunning, setBulkRunning ] = useState( false );
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

	// Pending, one-click-applicable items, used for the "Accept all" action.
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
						title={ section.title }
						initialOpen
					>
						<div className={ `${ CLASS_PREFIX }__items` }>
							{ section.items.map( ( item, itemIndex ) => {
								const key = getItemKey( sectionIndex, itemIndex );
								const status = itemStatuses[ key ] ?? 'pending';
								const isCollapsed = status === 'accepted' || status === 'dismissed';
								const block = item.block_index === null ? null : flatBlocks[ item.block_index ];
								const applyUnavailableReason = isPostStale
									? staleApplyReason
									: getApplyUnavailableReason( item, block );
								const isApplyUnavailable = !! applyUnavailableReason;
								const applyUnavailableReasonId = getItemReasonId( sectionIndex, itemIndex );

								if ( isCollapsed ) {
									return (
										<div
											key={ key }
											className={ `${ CLASS_PREFIX }__item is-collapsed is-${ status }` }
										>
											<span className={ `${ CLASS_PREFIX }__collapsed-status` }>
												{ status === 'accepted'
													? __( 'Applied', __i18n_text_domain__ )
													: __( 'Dismissed', __i18n_text_domain__ ) }
											</span>
											<span className={ `${ CLASS_PREFIX }__collapsed-title` }>{ item.title }</span>
											<button
												type="button"
												className={ `${ CLASS_PREFIX }__small-action` }
												onClick={ () => undoItem( key ) }
												disabled={ isPostStale || bulkRunning }
											>
												{ __( 'Undo', __i18n_text_domain__ ) }
											</button>
										</div>
									);
								}

								return (
									<div key={ key } className={ `${ CLASS_PREFIX }__item is-${ status }` }>
										<div className={ `${ CLASS_PREFIX }__item-header` }>
											<h4 className={ `${ CLASS_PREFIX }__item-title` }>{ item.title }</h4>
											<BlockRef
												index={ item.block_index }
												blocks={ flatBlocks }
												onFocus={ focusCurrentPostBlock }
												className={ `${ CLASS_PREFIX }__block-ref` }
											/>
										</div>
										<p className={ `${ CLASS_PREFIX }__feedback` }>{ item.feedback }</p>
										<p className={ `${ CLASS_PREFIX }__action` }>{ item.action }</p>
										{ item.current_text && item.suggested_text && (
											<div className={ `${ CLASS_PREFIX }__rewrite` }>
												<p className={ `${ CLASS_PREFIX }__rewrite-label` }>{ rewriteLabel }</p>
												<del>{ item.current_text }</del>
												<ins>{ item.suggested_text }</ins>
											</div>
										) }
										{ applyUnavailableReason && (
											<p
												id={ applyUnavailableReasonId }
												className={ `${ CLASS_PREFIX }__manual-reason` }
											>
												{ isPostStale
													? applyUnavailableReason
													: getUnavailableMessage( item, applyUnavailableReason ) }
											</p>
										) }
										<div className={ `${ CLASS_PREFIX }__actions` }>
											<button
												type="button"
												className={ `${ CLASS_PREFIX }__action-button is-primary` }
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
												className={ `${ CLASS_PREFIX }__action-button` }
												onClick={ () => dismissItem( key ) }
												disabled={ isPostStale || bulkRunning || status === 'applying' }
											>
												{ __( 'Dismiss', __i18n_text_domain__ ) }
											</button>
										</div>
										{ status === 'failed' && (
											<p className={ `${ CLASS_PREFIX }__status is-failed` }>{ failureMessage }</p>
										) }
									</div>
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
							? __( 'Accepting…', __i18n_text_domain__ )
							: sprintf(
									/* translators: %d is the number of one-click fixes available. */
									__( 'Accept all (%d)', __i18n_text_domain__ ),
									applyAllTargets.length
							  ) }
					</button>
				</footer>
			) }
		</div>
	);
}
