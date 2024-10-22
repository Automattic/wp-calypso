import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import autosize from 'autosize';
import React, { KeyboardEvent } from 'react';

export const ResizableTextarea: React.FC< {
	className: string;
	inputRef: React.RefObject< HTMLTextAreaElement >;
	sendMessageHandler: () => Promise< void >;
} > = ( { className, sendMessageHandler, inputRef } ) => {
	const onKeyDown = useCallback(
		async ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
			if ( inputRef.current?.value.trim() === '' ) {
				return;
			}
			if ( event.key === 'Enter' && ! event.shiftKey ) {
				event.preventDefault();
				await sendMessageHandler();
			}
		},
		[ inputRef, sendMessageHandler ]
	);

	useEffect( () => {
		// Set's back the textarea height after sending messages, it is needed for long messages.
		if ( inputRef.current ) {
			inputRef.current.style.height = 'auto';
			autosize.update( inputRef.current );
		}
	}, [ sendMessageHandler, inputRef ] );

	useEffect( () => {
		if ( inputRef.current ) {
			const currentInput = inputRef.current;
			autosize( currentInput );

			return () => {
				autosize.destroy( currentInput );
			};
		}
	}, [ inputRef ] );

	return (
		<textarea
			ref={ inputRef }
			rows={ 1 }
			className={ className }
			onKeyDown={ onKeyDown }
			placeholder={ __( 'Type a message…', __i18n_text_domain__ ) }
			style={ { transition: 'none' } }
		/>
	);
};
