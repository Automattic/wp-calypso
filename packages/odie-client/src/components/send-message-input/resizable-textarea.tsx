import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import autosize from 'autosize';
import React, { KeyboardEvent } from 'react';

export const ResizableTextarea: React.FC< {
	className: string;
	inputRef: React.RefObject< HTMLTextAreaElement >;
	keyUpHandle: () => void;
	sendMessageHandler: () => Promise< void >;
	setSubmitDisabled: ( shouldBeDisabled: boolean ) => void;
	shouldDisableInputField: boolean;
} > = ( {
	className,
	sendMessageHandler,
	inputRef,
	keyUpHandle,
	setSubmitDisabled,
	shouldDisableInputField = false,
} ) => {
	const textAreaPlaceholder = shouldDisableInputField
		? __( 'Just a moment…', __i18n_text_domain__ )
		: __( 'Type a message…', __i18n_text_domain__ );

	if ( shouldDisableInputField ) {
		setSubmitDisabled( true );
	}

	const onKeyUp = useCallback(
		async ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
			if ( inputRef.current?.value.trim() === '' ) {
				// call the handler to remove the validation message if visible.
				keyUpHandle();
				setSubmitDisabled( true );
				return;
			}

			setSubmitDisabled( false );

			if ( event.key === 'Enter' && ! event.shiftKey ) {
				event.preventDefault();
				await sendMessageHandler();
			}
		},
		[ inputRef, sendMessageHandler, keyUpHandle, setSubmitDisabled ]
	);

	const onKeyDown = useCallback(
		async ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
			// Prevent line break when user sends a message
			if ( event.key === 'Enter' && ! event.shiftKey && inputRef.current?.value.trim() !== '' ) {
				event.preventDefault();
			}

			// Prevent sending new line when user presses enter without any text
			if ( event.key === 'Enter' && inputRef.current?.value.trim() === '' ) {
				event.preventDefault();
			}
		},
		[ inputRef ]
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
			onKeyUp={ onKeyUp }
			placeholder={ textAreaPlaceholder }
			onKeyDown={ onKeyDown }
			style={ { transition: 'none' } }
			disabled={ shouldDisableInputField }
		/>
	);
};
