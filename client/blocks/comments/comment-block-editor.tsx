import { useReducedMotion } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { commentEmbedUrl, isBlockMarkup, loadCommentEditor } from './load-comment-editor';
import type { CommentsEditorSettings } from '@automattic/api-core';

import './comment-block-editor.scss';

type Props = {
	settings: CommentsEditorSettings;
	siteId: number;
	value: string;
	placeholder: string;
	label: string;
	takeFocus?: boolean;
	/** The height of the form row before this box replaced its textarea, which the row grows from and shrinks back to. */
	openFrom?: number;
	/** Shrinks the row back to `openFrom`, then calls `onClosed`. */
	closing?: boolean;
	onClosed?: () => void;
	onChange: ( content: string ) => void;
	onError: ( error: unknown ) => void;
	/** Native, not synthetic: the editor renders in its own React root, which React's events never leave. */
	onKeyDown?: ( event: KeyboardEvent ) => void;
	onFocus?: () => void;
	/** On a click or a move of focus outside the box. */
	onBlur?: () => void;
};

/**
 * The Jetpack Comments block editor in the Reader's comment form. A textarea the editor's size
 * holds its place until the first focus, so the box stays put when the editor takes over. From
 * there the editor owns the content and reports it through `onChange` as block markup.
 */
export default function CommentBlockEditor( {
	settings,
	siteId,
	value,
	placeholder,
	label,
	takeFocus,
	openFrom,
	closing,
	onClosed,
	onChange,
	onError,
	onKeyDown,
	onFocus,
	onBlur,
}: Props ) {
	const box = useRef< HTMLDivElement >( null );
	const textarea = useRef< HTMLTextAreaElement >( null );
	const container = useRef< HTMLDivElement >( null );
	const [ editor, setEditor ] = useState< 'none' | 'loading' | 'ready' >( 'none' );
	// Whether the writer is in the box, which opens the toolbar. From the first paint when the box
	// takes focus, so it arrives open, revealed by the box growing, not sliding in after.
	const [ active, setActive ] = useState( !! takeFocus );
	const opened = useRef( false );
	const gone = useRef( false );
	const unmount = useRef< ( () => void ) | void >( undefined );
	// Set by a click, so the editor's caret lands where it did; a keyboard arrival goes to the end.
	const clicked = useRef( false );
	// The editor keeps the callbacks it was mounted with, so it reads the latest through a ref.
	const latest = useRef( { value, onChange, onError, onKeyDown, onFocus, onBlur, onClosed } );
	latest.current = { value, onChange, onError, onKeyDown, onFocus, onBlur, onClosed };

	// The form row's height, not the box's or its parts': the editor swaps in for its stand-in
	// partway through, and the row's Send button shows on focus, so it slides in with the box.
	const reduceMotion = useReducedMotion();
	const row = () => box.current?.parentElement;
	const resize = ( from: number, to: number, fill?: FillMode ) =>
		! row()?.animate || reduceMotion
			? null
			: row()!.animate(
					[
						{ height: `${ from }px`, boxSizing: 'border-box', overflow: 'hidden' },
						{ height: `${ to }px`, boxSizing: 'border-box', overflow: 'hidden' },
					],
					{ duration: 250, easing: 'ease-in-out', fill }
				);

	useLayoutEffect( () => {
		if ( openFrom ) {
			resize( openFrom, row()!.offsetHeight );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- once, as the box replaces the textarea.
	}, [] );

	useEffect( () => {
		if ( ! closing ) {
			return;
		}

		// Held at the textarea's height, so nothing jumps before the textarea takes its place.
		const animation = openFrom ? resize( row()!.offsetHeight, openFrom, 'forwards' ) : null;
		if ( ! animation ) {
			latest.current.onClosed?.();
			return;
		}

		animation.onfinish = () => latest.current.onClosed?.();
		return () => animation.cancel();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- runs as closing turns on or off.
	}, [ closing ] );

	const openEditor = ( focus: boolean ) => {
		if ( opened.current ) {
			return;
		}

		opened.current = true;
		setEditor( 'loading' );
		loadCommentEditor( settings )
			.then( ( { mountEditor } ) => {
				if ( gone.current ) {
					return;
				}
				// Shown first: the editor can only take focus once it is visible.
				flushSync( () => setEditor( 'ready' ) );
				unmount.current = mountEditor( container.current!, {
					initialContent: latest.current.value,
					labels: {
						...settings.editor,
						embedUrl: commentEmbedUrl( siteId ),
					},
					placeholder,
					focus: focus
						? () => ( clicked.current ? ( textarea.current?.selectionStart ?? -1 ) : -1 )
						: undefined,
					onChange: ( content ) => latest.current.onChange( content ),
					onError: ( error ) => latest.current.onError( error ),
				} );
			} )
			.catch( ( error ) => {
				if ( ! gone.current ) {
					latest.current.onError( error );
				}
			} );
	};

	useEffect( () => {
		const element = box.current!;
		gone.current = false;
		const keydown = ( event: KeyboardEvent ) => latest.current.onKeyDown?.( event );
		const focusin = () => {
			setActive( true );
			latest.current.onFocus?.();
		};
		const leave = () => {
			setActive( false );
			latest.current.onBlur?.();
		};
		// Clicks are read from pointerdown, not focusout: Safari fires focusout for a button inside
		// the box too, with no relatedTarget, as does the stand-in hiding for the editor. The
		// editor's popovers render inside the box, so they don't count as leaving it.
		const pointerdown = ( event: PointerEvent ) => {
			if ( ! element.contains( event.target as Node ) ) {
				leave();
			}
		};
		const focusout = ( event: FocusEvent ) => {
			if ( event.relatedTarget instanceof Node && ! element.contains( event.relatedTarget ) ) {
				leave();
			}
		};
		element.addEventListener( 'keydown', keydown );
		element.addEventListener( 'focusin', focusin );
		element.addEventListener( 'focusout', focusout );
		document.addEventListener( 'pointerdown', pointerdown );

		// A draft from the editor is block markup, which only the editor shows.
		if ( isBlockMarkup( latest.current.value ) ) {
			openEditor( false );
		}

		return () => {
			gone.current = true;
			element.removeEventListener( 'keydown', keydown );
			element.removeEventListener( 'focusin', focusin );
			element.removeEventListener( 'focusout', focusout );
			document.removeEventListener( 'pointerdown', pointerdown );
			unmount.current?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- set up once, with the draft of that moment.
	}, [] );

	const text = editor !== 'ready' && isBlockMarkup( value ) ? '' : value;
	// The loading copy animates its own dots, so it drops the translation's.
	const prompt = placeholder.replace( /\s*(?:\.{3}|…+)$/u, '' );

	return (
		<div
			ref={ box }
			className={ clsx( 'comments__block-editor jetpack-comments jetpack-comments__box', {
				// Closing folds the toolbar too, so the words slide up to where the textarea shows them.
				'is-open': active && ! closing,
				'is-closing': closing,
			} ) }
		>
			<div className="comments__block-editor-placeholder" hidden={ editor === 'ready' }>
				{ /* The toolbar's strip, which the editor's own fills once a block has focus. */ }
				<div className="comments__block-editor-toolbar" />
				<div className="comments__block-editor-content">
					<textarea
						ref={ textarea }
						className="comments__block-editor-textarea"
						aria-label={ label }
						value={ text }
						// Held while the editor arrives, so nothing typed lands in a box about to go.
						readOnly={ editor === 'loading' }
						aria-busy={ editor === 'loading' }
						// Its loading copy, below, takes the placeholder's place.
						placeholder={ editor === 'loading' ? '' : placeholder }
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={ takeFocus }
						onPointerDown={ () => ( clicked.current = true ) }
						onFocus={ () => openEditor( true ) }
						onChange={ ( event ) => onChange( event.target.value ) }
					/>
					{ editor === 'loading' && ! text && (
						<span className="comments__block-editor-loading" aria-hidden="true">
							{ prompt }
							<span>.</span>
							<span>.</span>
							<span>.</span>
						</span>
					) }
				</div>
			</div>
			<div
				ref={ container }
				className="jetpack-comments__editor"
				role="group"
				aria-label={ label }
				hidden={ editor !== 'ready' }
			/>
		</div>
	);
}
