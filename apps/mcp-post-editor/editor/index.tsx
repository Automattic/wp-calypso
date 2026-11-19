import {
	store as blockEditorStore,
	BlockEditorProvider,
	BlockList,
	BlockToolbar,
	BlockTools,
	ObserveTyping,
	WritingFlow,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { parse, serialize, type Block as BlockInstance } from '@wordpress/blocks';
import { Button, Popover, SlotFillProvider } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import {
	useEffect,
	useLayoutEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from '@wordpress/element';
import { isKeyboardEvent } from '@wordpress/keycodes';
import { createUndoManager, type UndoManager } from '@wordpress/undo-manager';
import { AskAssistant, AssistantChips, type Prompt, type TextSelection } from './assistant';
import './blocks';
import { AgentChanges, ChangedBlocks, type AgentChange, type Decision } from './changes';
import { KIND_LABEL, ProofreadLayer } from './proofread-layer';
import type { ProofreadIssue } from './proofread';
import type { ClipboardEvent, CSSProperties, KeyboardEvent } from 'react';

// `revision` changes when the post comes from outside the editor: opened, or merged with the
// server's changes. The editor then shows it, keeping the blocks that didn't change. `id` is the
// site and post: another post gets a new editor.
export type EditorPost = { id: string; title: string; content: string; revision: number };
// The model's title options, from `wpcom-post-editor-state`.
export type TitleSuggestions = { id: string; titles: string[] };

type Props = {
	post?: EditorPost;
	// The site's editor styles, from `wpcom-post-editor-config`.
	styles: { css: string }[];
	readOnly: boolean;
	status: string;
	statusTitle?: string;
	// The site and post, as "example.com · post 42".
	location?: string;
	isError: boolean;
	notices: string[];
	isFullscreen: boolean;
	canFullscreen: boolean;
	// The panel's height in CSS; the canvas scrolls inside it.
	height: string;
	onChange: ( post: { title: string; content: string } ) => void;
	onToggleFullscreen: () => void;
	// The assistant's pending changes, and the ones just accepted, which can still be undone.
	changes: AgentChange[];
	accepted?: { ids: string[]; label: string };
	onDecide: ( decision: Decision, ids: string[] ) => void;
	// Saving to WordPress.com, and the conflict notice: the post's `remote_modified` stamp.
	isSaving: boolean;
	onSave: () => void;
	conflict?: string;
	onConflict: ( choice: 'reload' | 'keep' | 'dismiss' ) => void;
	// Prompts for the assistant through the host's chat.
	canMessage: boolean;
	onPrompt: ( prompt: Prompt ) => void;
	onAsk: ( question: string, selection: TextSelection ) => void;
	onSelect: ( selection?: TextSelection ) => void;
	// The open proofreading issues; `failed` counts those whose text was no longer there.
	issues: ProofreadIssue[];
	onProofreadDone: ( ids: string[], failed: number ) => void;
	// The model's title options, and a pick or a dismiss of them.
	titleSuggestions?: TitleSuggestions;
	onTitleSuggestionsDone: ( id: string ) => void;
};

// Reuses each current block whose markup is unchanged, so a merge doesn't remount the block
// the user is typing in, and the selection and caret stay.
function keepUnchanged( current: BlockInstance[], next: BlockInstance[] ) {
	const unused = current.map( ( block ) => ( { block, markup: serialize( block ) } ) );
	return next.map( ( block ) => {
		const markup = serialize( block );
		const index = unused.findIndex( ( item ) => item.markup === markup );
		return index < 0 ? block : unused.splice( index, 1 )[ 0 ].block;
	} );
}

type History = { manager: UndoManager< BlockInstance[] >; value: BlockInstance[] };
type HistoryAction =
	| { type: 'record'; value: BlockInstance[]; isStaged: boolean }
	| { type: 'undo' | 'redo' }
	| { type: 'reset'; value: BlockInstance[] };

const newHistory = ( value: BlockInstance[] ): History => ( {
	manager: createUndoManager(),
	value,
} );

// useStateWithHistory from @wordpress/compose, plus `reset`, which starts a new history so undo
// can't bring back the blocks from before a post that came from outside the editor.
function historyReducer( state: History, action: HistoryAction ): History {
	switch ( action.type ) {
		case 'record':
			state.manager.addRecord(
				[ { id: 'blocks', changes: { blocks: { from: state.value, to: action.value } } } ],
				action.isStaged
			);
			return { ...state, value: action.value };
		case 'undo':
		case 'redo': {
			const record = action.type === 'undo' ? state.manager.undo() : state.manager.redo();
			if ( ! record ) {
				return state;
			}
			const { from, to } = record[ 0 ].changes.blocks;
			return { ...state, value: action.type === 'undo' ? from : to };
		}
		case 'reset':
			return newHistory( action.value );
	}
}

// Plain text only where the browser supports it, so drop and Cmd+B can't add markup; elsewhere
// the paste handler keeps pasted text plain.
const PLAIN_TEXT_ONLY = ( () => {
	try {
		const element = document.createElement( 'div' );
		element.contentEditable = 'plaintext-only';
		return element.contentEditable === 'plaintext-only';
	} catch {
		return false;
	}
} )();

// A heading like the block editor's post title, so the theme's title styles apply, instead of a
// form control. Plain text only; it wraps and grows with the text.
export function TitleField( {
	value,
	readOnly,
	isChanged,
	onChange,
	suggestions,
	onSuggestionsDone,
}: {
	value: string;
	readOnly: boolean;
	isChanged: boolean;
	onChange: ( title: string ) => void;
	suggestions?: TitleSuggestions;
	onSuggestionsDone: ( id: string ) => void;
} ) {
	const ref = useRef< HTMLHeadingElement >( null );
	const { clearSelectedBlock } = useDispatch( blockEditorStore );
	// Only a title from outside: rewriting what the user typed would move the caret.
	useLayoutEffect( () => {
		if ( ref.current && ref.current.textContent !== value ) {
			ref.current.textContent = value;
		}
	}, [ value ] );
	const onPaste = ( event: ClipboardEvent ) => {
		event.preventDefault();
		const text = event.clipboardData.getData( 'text/plain' ).replace( /\s*\n\s*/g, ' ' );
		document.execCommand( 'insertText', false, text );
	};
	// Types the title in, as the user would, so it saves like typing and the title's own undo
	// takes it back. A selected block keeps the writing flow as the editing host, so the block is
	// unselected first, and the title focused once that has rendered. The change is reported here
	// too, in case the input event still goes elsewhere.
	const pick = ( id: string, next: string ) => {
		clearSelectedBlock();
		requestAnimationFrame( () => {
			const element = ref.current;
			if ( element ) {
				element.focus();
				document.getSelection()?.selectAllChildren( element );
				document.execCommand( 'insertText', false, next );
				if ( element.textContent !== next ) {
					element.textContent = next;
				}
				if ( document.activeElement !== element ) {
					element.focus();
				}
			}
			onChange( next );
			onSuggestionsDone( id );
		} );
	};
	return (
		<div className="mcp-post-editor__title is-layout-constrained has-global-padding">
			{ /* An editable heading with the textbox role, as the block editor's own post title. */ }
			{ /* eslint-disable-next-line jsx-a11y/heading-has-content */ }
			<h1
				ref={ ref }
				className={ `wp-block wp-block-post-title editor-post-title editor-post-title__input${
					isChanged ? ' is-agent-changed' : ''
				}${ value ? '' : ' is-empty' }` }
				contentEditable={ ! readOnly && ( PLAIN_TEXT_ONLY ? 'plaintext-only' : true ) }
				suppressContentEditableWarning
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
				role="textbox"
				aria-label="Add title"
				aria-readonly={ readOnly }
				data-placeholder="Add title"
				onInput={ ( event ) =>
					onChange( ( event.currentTarget.textContent ?? '' ).replace( /\n/g, ' ' ) )
				}
				onKeyDown={ ( event ) =>
					event.key === 'Enter' && ! event.nativeEvent.isComposing && event.preventDefault()
				}
				onPaste={ onPaste }
			/>
			{ ! readOnly && suggestions && (
				<div className="mcp-post-editor__titles" role="group" aria-label="Suggested titles">
					{ suggestions.titles.map( ( title ) => (
						<button
							key={ title }
							type="button"
							className="mcp-post-editor__chip"
							onClick={ () => pick( suggestions.id, title ) }
						>
							{ title }
						</button>
					) ) }
					<button
						type="button"
						className="mcp-post-editor__titles-dismiss"
						aria-label="Dismiss the suggested titles"
						onClick={ () => onSuggestionsDone( suggestions.id ) }
					>
						×
					</button>
				</div>
			) }
		</div>
	);
}

function Canvas( {
	post,
	styles,
	readOnly,
	changes,
	onChange,
	issues,
	onProofreadDone,
	onVisibleIssues,
	applyRef,
	openRef,
	titleSuggestions,
	onTitleSuggestionsDone,
}: Pick<
	Props,
	| 'styles'
	| 'readOnly'
	| 'onChange'
	| 'changes'
	| 'issues'
	| 'onProofreadDone'
	| 'titleSuggestions'
	| 'onTitleSuggestionsDone'
> & {
	post: EditorPost;
	onVisibleIssues: ( ids: string[] ) => void;
	applyRef: Parameters< typeof ProofreadLayer >[ 0 ][ 'applyRef' ];
	openRef: Parameters< typeof ProofreadLayer >[ 0 ][ 'openRef' ];
} ) {
	const [ history, dispatch ] = useReducer( historyReducer, post.content, ( content ) =>
		newHistory( parse( content ) )
	);
	const blocks = history.value;
	const [ title, setTitle ] = useState( post.title );
	// The post as the editor last reported it or was given it, so neither echoes back.
	const reported = useRef( { title: post.title, content: serialize( blocks ) } );
	const revision = useRef( post.revision );
	const onChangeRef = useRef( onChange );
	onChangeRef.current = onChange;
	const blocksRef = useRef( blocks );
	blocksRef.current = blocks;

	// A layout effect, so a post shown with flushSync is in the editor before the next keystroke.
	useLayoutEffect( () => {
		if ( post.revision === revision.current ) {
			return;
		}
		revision.current = post.revision;
		const next = keepUnchanged( blocksRef.current, parse( post.content ) );
		reported.current = { title: post.title, content: serialize( next ) };
		dispatch( { type: 'reset', value: next } );
		setTitle( post.title );
	}, [ post ] );

	useEffect( () => {
		const content = serialize( blocks );
		if ( content === reported.current.content && title === reported.current.title ) {
			return;
		}
		reported.current = { title, content };
		onChangeRef.current( { title, content } );
	}, [ blocks, title ] );

	// On the writing flow, the target of keys typed in the blocks. The title keeps the browser's
	// own undo.
	const onKeyDown = ( event: KeyboardEvent ) => {
		if ( event.target instanceof Element && event.target.closest( '.editor-post-title' ) ) {
			return;
		}
		const key = event.nativeEvent;
		const undo = isKeyboardEvent.primary( key, 'z' );
		const redo = isKeyboardEvent.primaryShift( key, 'z' ) || isKeyboardEvent.primary( key, 'y' );
		if ( undo || redo ) {
			event.preventDefault();
			dispatch( { type: undo ? 'undo' : 'redo' } );
		}
	};

	const settings = useMemo(
		() => ( {
			// A row above the canvas: a floating toolbar has no room above a block at the top of
			// a small panel, and covers the block's text or the next block instead.
			hasFixedToolbar: true,
			// Shows the blocks without editing them; links stay clickable.
			isPreviewMode: readOnly,
		} ),
		[ readOnly ]
	);

	return (
		<BlockEditorProvider
			value={ blocks }
			settings={ settings }
			onInput={ ( next: BlockInstance[] ) =>
				dispatch( { type: 'record', value: next, isStaged: true } )
			}
			onChange={ ( next: BlockInstance[] ) =>
				dispatch( { type: 'record', value: next, isStaged: false } )
			}
		>
			{ ! readOnly && (
				<div className="mcp-post-editor__toolbar">
					<BlockToolbar hideDragHandle />
				</div>
			) }
			<BlockTools className="mcp-post-editor__canvas">
				{ /* The site's styles, scoped to the canvas as BlockCanvas does without an iframe:
				MCP hosts' CSP blocks the blob: iframe it would make. */ }
				<EditorStyles
					styles={ styles }
					scope=":where(.editor-styles-wrapper)"
					transformOptions={ { ignoredSelectors: [ /\.editor-styles-wrapper/gi ] } }
				/>
				<ChangedBlocks indexes={ changes.flatMap( ( change ) => change.block_index ?? [] ) } />
				<ProofreadLayer
					issues={ issues }
					onDone={ onProofreadDone }
					onVisible={ onVisibleIssues }
					applyRef={ applyRef }
					openRef={ openRef }
				/>
				<WritingFlow className="editor-styles-wrapper" onKeyDown={ onKeyDown }>
					<ObserveTyping>
						<TitleField
							value={ title }
							readOnly={ readOnly }
							isChanged={ changes.some( ( change ) => change.block_index === null ) }
							onChange={ ( next ) => setTitle( next ) }
							suggestions={ titleSuggestions }
							onSuggestionsDone={ onTitleSuggestionsDone }
						/>
						<BlockList className="is-layout-constrained has-global-padding" />
					</ObserveTyping>
				</WritingFlow>
			</BlockTools>
		</BlockEditorProvider>
	);
}

export function PostEditor( {
	post,
	status,
	statusTitle,
	location,
	isError,
	notices,
	isFullscreen,
	canFullscreen,
	height,
	onToggleFullscreen,
	accepted,
	onDecide,
	isSaving,
	onSave,
	conflict,
	onConflict,
	canMessage,
	onPrompt,
	onAsk,
	onSelect,
	...canvas
}: Props ) {
	// The issues whose quote the canvas still has; the others are out of view.
	const [ visibleIds, setVisibleIds ] = useState< string[] >( [] );
	const applyRef = useRef< ( list: ProofreadIssue[] ) => void >( undefined );
	const openRef = useRef< ( id: string ) => void >( undefined );
	const [ isListOpen, setListOpen ] = useState( false );
	const onVisibleIssues = ( ids: string[] ) =>
		setVisibleIds( ( current ) => ( current.join() === ids.join() ? current : ids ) );
	const visible = canvas.issues.filter( ( issue ) => visibleIds.includes( issue.id ) );
	// The list closes itself when the last issue goes.
	useEffect( () => {
		if ( ! visible.length ) {
			setListOpen( false );
		}
	}, [ visible.length ] );
	// After a row's Apply or Dismiss, the focus goes to the row now in its place, or the last one,
	// or the canvas when none is left, once the row has gone. An Apply that couldn't apply leaves
	// the row, and nothing to move.
	const listRef = useRef< HTMLUListElement >( null );
	const focusAfter = useRef< { index: number; id: string } >( undefined );
	useLayoutEffect( () => {
		const after = focusAfter.current;
		if ( ! after || visible.some( ( issue ) => issue.id === after.id ) ) {
			return;
		}
		focusAfter.current = undefined;
		const rows =
			listRef.current?.querySelectorAll< HTMLButtonElement >( '.mcp-post-editor__issue' );
		const row = rows?.[ Math.min( after.index, rows.length - 1 ) ];
		( row ?? document.querySelector< HTMLElement >( '.editor-styles-wrapper' ) )?.focus();
	} );
	const finishRow = ( index: number, id: string, finish: () => void ) => {
		focusAfter.current = { index, id };
		finish();
		// Unarmed if the row stays: the update that removes it renders before this runs.
		setTimeout( () => {
			if ( focusAfter.current?.id === id ) {
				focusAfter.current = undefined;
			}
		} );
	};
	const { readOnly } = canvas;
	return (
		<SlotFillProvider>
			<div
				className={ `mcp-post-editor${ isFullscreen ? ' is-fullscreen' : '' }` }
				style={ { '--mcp-post-editor-height': height } as CSSProperties }
			>
				<div className="mcp-post-editor__bar">
					<p
						className={ `mcp-post-editor__status${ isError ? ' is-error' : '' }` }
						role="status"
						title={ statusTitle }
					>
						{ status }
					</p>
					{ location && (
						<p className="mcp-post-editor__location" title={ location }>
							{ location }
						</p>
					) }
					<div className="mcp-post-editor__actions">
						{ ! readOnly && <AssistantChips canMessage={ canMessage } onPrompt={ onPrompt } /> }
						{ ! readOnly && (
							<button
								type="button"
								className="mcp-post-editor__chip is-primary"
								aria-busy={ isSaving }
								disabled={ isSaving || ! post }
								onClick={ onSave }
							>
								Save
							</button>
						) }
						{ canFullscreen && (
							<button
								type="button"
								className="mcp-post-editor__chip"
								onClick={ onToggleFullscreen }
							>
								{ isFullscreen ? 'Collapse' : 'Expand' }
							</button>
						) }
					</div>
				</div>
				{ ! readOnly && conflict && (
					<div className="mcp-post-editor__conflict" role="alert">
						<p>
							The post changed on WordPress.com since you opened it. Reload discards your unsaved
							edits in this panel.
						</p>
						<div className="mcp-post-editor__change-actions">
							<Button
								size="compact"
								variant="secondary"
								disabled={ isSaving }
								onClick={ () => onConflict( 'reload' ) }
							>
								Reload
							</Button>
							<Button
								size="compact"
								variant="primary"
								disabled={ isSaving }
								onClick={ () => onConflict( 'keep' ) }
							>
								Keep mine
							</Button>
							<Button size="compact" variant="tertiary" onClick={ () => onConflict( 'dismiss' ) }>
								Dismiss
							</Button>
						</div>
					</div>
				) }
				{ notices.length > 0 && (
					<p className="mcp-post-editor__error" role="alert">
						{ notices.join( '\n' ) }
					</p>
				) }
				<AgentChanges changes={ canvas.changes } accepted={ accepted } onDecide={ onDecide } />
				{ /* Read-only gets a new editor, as its post is a sanitized copy. */ }
				{ post && (
					<Canvas
						key={ `${ post.id }${ readOnly ? ':read-only' : '' }` }
						post={ post }
						onVisibleIssues={ onVisibleIssues }
						applyRef={ applyRef }
						openRef={ openRef }
						{ ...canvas }
					/>
				) }
				<div className="mcp-post-editor__dock">
					{ ! readOnly && (
						<AskAssistant canMessage={ canMessage } onAsk={ onAsk } onSelect={ onSelect } />
					) }
					{ ! readOnly && isListOpen && visible.length > 0 && (
						<ul
							ref={ listRef }
							className="mcp-post-editor__issues"
							aria-label="Proofreading issues"
						>
							{ visible.map( ( issue, index ) => (
								<li key={ issue.id }>
									<button
										type="button"
										className="mcp-post-editor__issue"
										onClick={ () => openRef.current?.( issue.id ) }
									>
										<b>{ KIND_LABEL[ issue.kind ] ?? issue.kind }</b> · “{ issue.quote }” →{ ' ' }
										{ issue.replacement ? `“${ issue.replacement }”` : 'remove' }
									</button>
									<span className="mcp-post-editor__issue-actions">
										<Button
											size="small"
											variant="tertiary"
											onClick={ () =>
												finishRow( index, issue.id, () =>
													canvas.onProofreadDone( [ issue.id ], 0 )
												)
											}
										>
											Dismiss
										</Button>
										<Button
											size="small"
											variant="primary"
											onClick={ () =>
												finishRow( index, issue.id, () => applyRef.current?.( [ issue ] ) )
											}
										>
											Apply
										</Button>
									</span>
								</li>
							) ) }
						</ul>
					) }
					{ ! readOnly && visible.length > 0 && (
						<div className="mcp-post-editor__pill">
							<button
								type="button"
								aria-expanded={ isListOpen }
								onClick={ () => setListOpen( ! isListOpen ) }
							>
								{ visible.length } { visible.length === 1 ? 'issue' : 'issues' }
							</button>
							<span aria-hidden="true">·</span>
							<button type="button" onClick={ () => applyRef.current?.( visible ) }>
								Apply all
							</button>
							<span aria-hidden="true">·</span>
							<button
								type="button"
								onClick={ () =>
									canvas.onProofreadDone(
										visible.map( ( issue ) => issue.id ),
										0
									)
								}
							>
								Dismiss all
							</button>
						</div>
					) }
				</div>
			</div>
			<Popover.Slot />
		</SlotFillProvider>
	);
}
