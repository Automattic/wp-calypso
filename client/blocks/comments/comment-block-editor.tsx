import { useEffect, useRef } from 'react';
import { loadCommentEditor } from './load-comment-editor';
import type { SiteCommentsEditorSettings } from '@automattic/api-core';
import type { KeyboardEvent } from 'react';

import './comment-block-editor.scss';

type Props = {
	settings: SiteCommentsEditorSettings;
	initialContent: string;
	placeholder: string;
	label: string;
	takeFocus?: boolean;
	onChange: ( content: string ) => void;
	onError: ( error: unknown ) => void;
	onKeyDown?: ( event: KeyboardEvent< HTMLDivElement > ) => void;
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
	const callbacks = useRef( { onChange, onError } );
	callbacks.current = { onChange, onError };

	useEffect( () => {
		const element = container.current;
		if ( ! element ) {
			return;
		}

		let unmount: ( () => void ) | void;
		let gone = false;

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
			unmount?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mounted once, with the content of that moment.
	}, [] );

	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions -- keyboard shortcuts for the editor inside.
		<div
			className="comments__block-editor jetpack-comments jetpack-comments__box is-open"
			onKeyDown={ onKeyDown }
			onFocus={ onFocus }
		>
			<div
				ref={ container }
				className="jetpack-comments__editor"
				role="group"
				aria-label={ label }
			/>
		</div>
	);
}
