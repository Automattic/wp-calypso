import {
	BlockEditorProvider,
	BlockList,
	BlockTools,
	ObserveTyping,
	WritingFlow,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { parse, serialize, type Block as BlockInstance } from '@wordpress/blocks';
import { Button, Popover, SlotFillProvider } from '@wordpress/components';
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
import './blocks';
import { AgentChanges, ChangedBlocks, type AgentChange, type Decision } from './changes';
import type { CSSProperties, KeyboardEvent } from 'react';

// `revision` changes when the post comes from outside the editor: opened, or merged with the
// server's changes. The editor then shows it, keeping the blocks that didn't change. `id` is the
// site and post: another post gets a new editor.
export type EditorPost = { id: string; title: string; content: string; revision: number };

type Props = {
	post?: EditorPost;
	// The site's editor styles, from `wpcom-post-editor-config`.
	styles: { css: string }[];
	readOnly: boolean;
	status: string;
	statusTitle?: string;
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

function TitleField( {
	value,
	readOnly,
	isChanged,
	onChange,
}: {
	value: string;
	readOnly: boolean;
	isChanged: boolean;
	onChange: ( title: string ) => void;
} ) {
	const ref = useRef< HTMLTextAreaElement >( null );
	// Grows with the text instead of scrolling, also when the width or the theme's fonts change.
	useLayoutEffect( () => {
		const element = ref.current;
		if ( ! element ) {
			return;
		}
		const grow = () => {
			element.style.height = 'auto';
			element.style.height = `${ element.scrollHeight }px`;
		};
		grow();
		const observer = new ResizeObserver( grow );
		observer.observe( element );
		document.fonts?.ready.then( grow );
		return () => observer.disconnect();
	}, [ value ] );
	return (
		<div className="mcp-post-editor__title is-layout-constrained has-global-padding">
			<h1 className={ `wp-block wp-block-post-title${ isChanged ? ' is-agent-changed' : '' }` }>
				<textarea
					ref={ ref }
					aria-label="Add title"
					placeholder="Add title"
					rows={ 1 }
					value={ value }
					readOnly={ readOnly }
					onChange={ ( event ) => onChange( event.target.value.replace( /\n/g, ' ' ) ) }
				/>
			</h1>
		</div>
	);
}

function Canvas( {
	post,
	styles,
	readOnly,
	changes,
	onChange,
}: Pick< Props, 'styles' | 'readOnly' | 'onChange' | 'changes' > & { post: EditorPost } ) {
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
		if ( event.target instanceof HTMLTextAreaElement ) {
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
			hasFixedToolbar: false,
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
			<BlockTools className="mcp-post-editor__canvas">
				{ /* The site's styles, scoped to the canvas as BlockCanvas does without an iframe:
				MCP hosts' CSP blocks the blob: iframe it would make. */ }
				<EditorStyles
					styles={ styles }
					scope=":where(.editor-styles-wrapper)"
					transformOptions={ { ignoredSelectors: [ /\.editor-styles-wrapper/gi ] } }
				/>
				<ChangedBlocks indexes={ changes.flatMap( ( change ) => change.block_index ?? [] ) } />
				<WritingFlow className="editor-styles-wrapper" onKeyDown={ onKeyDown }>
					<ObserveTyping>
						<TitleField
							value={ title }
							readOnly={ readOnly }
							isChanged={ changes.some( ( change ) => change.block_index === null ) }
							onChange={ ( next ) => setTitle( next ) }
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
	isError,
	notices,
	isFullscreen,
	canFullscreen,
	height,
	onToggleFullscreen,
	accepted,
	onDecide,
	...canvas
}: Props ) {
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
					{ canFullscreen && (
						<Button size="compact" variant="secondary" onClick={ onToggleFullscreen }>
							{ isFullscreen ? 'Collapse' : 'Expand' }
						</Button>
					) }
				</div>
				{ notices.length > 0 && (
					<p className="mcp-post-editor__error" role="alert">
						{ notices.join( '\n' ) }
					</p>
				) }
				<AgentChanges changes={ canvas.changes } accepted={ accepted } onDecide={ onDecide } />
				{ /* Read-only gets a new editor, as its post is a sanitized copy. */ }
				{ post && (
					<Canvas
						key={ `${ post.id }${ canvas.readOnly ? ':read-only' : '' }` }
						post={ post }
						{ ...canvas }
					/>
				) }
			</div>
			<Popover.Slot />
		</SlotFillProvider>
	);
}
