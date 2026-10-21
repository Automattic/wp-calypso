import { useEffect, useRef } from 'react';
import { loadCommentEditor } from './load-comment-editor';
import type { SiteCommentsEditorSettings } from '@automattic/api-core';

import './comment-block-editor.scss';

type Props = {
	settings: SiteCommentsEditorSettings;
	initialContent: string;
	placeholder: string;
	label: string;
	takeFocus?: boolean;
	onChange: ( content: string ) => void;
	onError: ( error: unknown ) => void;
	/** Native, not synthetic: the editor renders in its own React root, which React's events never leave. */
	onKeyDown?: ( event: KeyboardEvent ) => void;
	onFocus?: () => void;
};

/**
 * The Jetpack Comments block editor in the Reader's comment form. Mounted once; the editor
 * owns the content from there and reports it through `onChange` as block markup.
 */
export default function CommentBlockEditor( {
	settings,
	initialContent,
	placeholder,
	label,
	takeFocus,
	onChange,
	onError,
	onKeyDown,
	onFocus,
}: Props ) {
	const container = useRef< HTMLDivElement >( null );
	// The editor keeps the callbacks it was mounted with, so it reads the latest through a ref.
	const callbacks = useRef( { onChange, onError, onKeyDown, onFocus } );
	callbacks.current = { onChange, onError, onKeyDown, onFocus };

	useEffect( () => {
		const element = container.current;
		if ( ! element ) {
			return;
		}

		let unmount: ( () => void ) | void;
		let gone = false;
		const keydown = ( event: KeyboardEvent ) => callbacks.current.onKeyDown?.( event );
		const focusin = () => callbacks.current.onFocus?.();
		element.addEventListener( 'keydown', keydown );
		element.addEventListener( 'focusin', focusin );

		loadCommentEditor( settings ).then(
			( { mountEditor } ) => {
				if ( gone ) {
					return;
				}
				unmount = mountEditor( element, {
					initialContent,
					labels: settings.editor,
					placeholder,
					focus: takeFocus ? () => -1 : undefined,
					onChange: ( content ) => callbacks.current.onChange( content ),
					onError: ( error ) => callbacks.current.onError( error ),
				} );
			},
			( error ) => {
				if ( ! gone ) {
					callbacks.current.onError( error );
				}
			}
		);

		return () => {
			gone = true;
			element.removeEventListener( 'keydown', keydown );
			element.removeEventListener( 'focusin', focusin );
			unmount?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mounted once, with the content of that moment.
	}, [] );

	return (
		<div className="comments__block-editor jetpack-comments jetpack-comments__box is-open">
			<div
				ref={ container }
				className="jetpack-comments__editor"
				role="group"
				aria-label={ label }
			/>
		</div>
	);
}
