import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { markActionOrigin, takeActionOrigin } from '../utils/action-origin';
import { startNewUserRequest } from '../utils/canvas-binding';
import { consumeNextMessageExternalContextEntries } from '../utils/external-context';
import { recordAgentsManagerTracksEvent, recordBigSkyTracksEvent } from '../utils/tracks';
import { startTurn } from '../utils/turn-id';
import { useImageUpload } from './use-image-upload';
import type { UseCreditsResult } from './use-credits';
import type { SubmitOptions, UseAgentChatReturn } from '@automattic/agenttic-client';
import type { RefObject } from 'react';

interface UseChatComposerOptions {
	isReaderChat: boolean;
	onSubmit: UseAgentChatReturn[ 'onSubmit' ];
	abortCurrentRequest: UseAgentChatReturn[ 'abortCurrentRequest' ];
	beforeSubmit: UseCreditsResult[ 'beforeSubmit' ];
	/** Answers a parked `wp-admin-navigate` call before the next message goes out. */
	flushPendingNavigation: () => Promise< void >;
	/**
	 * The suggestion prompts on screen, so a send can be told apart from a typed
	 * one: Agenttic submits a clicked suggestion before the click handler runs.
	 */
	suggestionPromptsRef: RefObject< Set< string > >;
}

/**
 * The chat composer: its input, the image upload that runs before a send, and
 * every path a user message is sent through — the composer, context cards and
 * the host bridge. A send that is dropped, stopped or fails leaves the composer as
 * it was, so the user can retry without retyping.
 */
export function useChatComposer( {
	isReaderChat,
	onSubmit,
	abortCurrentRequest,
	beforeSubmit,
	flushPendingNavigation,
	suggestionPromptsRef,
}: UseChatComposerOptions ) {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ uploadError, setUploadError ] = useState< string | null >( null );

	const imageUploadResult = useImageUpload();
	// Reader chat is a public blog frontend — visitors can't upload media.
	const imageUpload = isReaderChat ? undefined : imageUploadResult;
	const pendingImages = imageUpload?.pendingImages || [];
	const uploadImagesToWordPress = imageUpload?.uploadImagesToWordPress;
	const isUploadingImages = imageUpload?.isUploadingImages ?? false;

	// Whether the last `submitComposerMessage` call dispatched. Dropped, stopped and
	// failed sends leave the composer intact on purpose.
	const wasLastSendDispatchedRef = useRef( false );

	// Synchronous lock for the upload phase: same-tick re-entry (double-click,
	// programmatic submit) lands before the `isUploadingImages` state does.
	const isUploadingRef = useRef( false );

	const setChatInput = useCallback( ( value: string ) => {
		if ( typeof value !== 'string' ) {
			return;
		}

		setInputValue( value );

		const textarea = document.querySelector< HTMLTextAreaElement >(
			'.agenttic [data-slot="chat-input"] [data-slot="textarea"]'
		);
		if ( textarea ) {
			textarea.focus();
			textarea.setSelectionRange( value.length, value.length );
		}
	}, [] );

	const submitComposerMessage = useCallback(
		async ( message: string ) => {
			wasLastSendDispatchedRef.current = false;

			// Taken before the drop below, so a dropped send never labels the next one.
			const origin = takeActionOrigin( 'send' );
			const source =
				origin === 'composer' && suggestionPromptsRef.current.has( message )
					? 'suggestion'
					: origin;

			// Drop sends that arrive while a batch uploads (suggestion clicks,
			// programmatic submits) instead of interleaving a second message.
			if ( isUploadingRef.current || isUploadingImages ) {
				return;
			}

			setUploadError( null );

			startTurn();
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message', {
				message_length: message?.length || 0,
				has_images: pendingImages.length > 0,
				source,
			} );

			let imageUrls: SubmitOptions[ 'imageUrls' ];
			if ( pendingImages.length > 0 && uploadImagesToWordPress ) {
				isUploadingRef.current = true;

				try {
					// On submit, Agenttic clears the controlled input (caret at 0). For a
					// composer send, put the message back while images upload: a microtask
					// lets it land after the clear, and `setChatInput` moves the caret to
					// the end. Suggestion and programmatic sends leave any draft alone.
					// Agenttic sends the trimmed draft, hence the trim compare.
					if ( inputValue.trim() === message ) {
						await Promise.resolve();
						setChatInput( message );
					}

					const mediaObjects = await uploadImagesToWordPress();

					recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_success', {
						count: mediaObjects.length,
					} );

					imageUrls = mediaObjects.map( ( media ) => ( {
						url: media.url,
						metadata: {
							id: media.id, // WordPress attachment ID
							title: media.title,
							fileName: media.fileName,
							fileType: media.fileType,
							fileSize: media.fileSize,
							dimensions: media.dimensions,
							uploadDate: media.uploadDate,
							alt: media.alt,
							caption: media.caption,
						},
					} ) );
				} catch ( caughtError ) {
					// Stopped during upload: the previews are restored and a
					// composer-typed message stays in the input.
					if ( caughtError instanceof Error && caughtError.name === 'AbortError' ) {
						recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_cancel', {
							count: pendingImages.length,
						} );
						return;
					}

					recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_error', {
						count: pendingImages.length,
					} );
					setUploadError(
						__( 'Failed to upload images. Please try again.', __i18n_text_domain__ )
					);
					return;
				} finally {
					isUploadingRef.current = false;
				}

				// Clear the input only if it still holds this message: a suggestion send
				// may have left an unrelated draft there.
				setInputValue( ( currentValue ) => ( currentValue === message ? '' : currentValue ) );
			}

			// A new message is a new intent, so it starts unbound and unblocked.
			// Otherwise the previous turn's canvas would judge it (`useCanvasMoveAbort`
			// aborts on sight if the user has since navigated), and that turn's leftover
			// block would refuse its writes.
			//
			// Done here, not in `submitChatMessage`: the composer calls this callback
			// directly, and the early returns above must not reset a binding that a
			// running request still owns.
			startNewUserRequest();

			wasLastSendDispatchedRef.current = true;
			try {
				// First, so this message follows the parked call's tool result. Never throws.
				await flushPendingNavigation();

				// Images dispatch via Agenttic's `imageUrls` option — the resulting
				// `FilePart`s persist in conversation history with their metadata.
				await ( imageUrls ? onSubmit( message, { imageUrls } ) : onSubmit( message ) );
			} catch {
				// A rejected dispatch already surfaces via Agenttic's error state;
				// put the message back (unless a newer draft replaced it) for a retry.
				wasLastSendDispatchedRef.current = false;
				setInputValue( ( currentValue ) => ( currentValue === '' ? message : currentValue ) );
				return;
			}

			consumeNextMessageExternalContextEntries();
		},
		[
			flushPendingNavigation,
			inputValue,
			isUploadingImages,
			onSubmit,
			pendingImages.length,
			setChatInput,
			suggestionPromptsRef,
			uploadImagesToWordPress,
		]
	);

	const stopResponse = useCallback( () => {
		// `abortUpload` reports whether it stopped an in-flight batch, so a stop
		// that lands just after the upload settles still aborts the agent request.
		const didStopUpload = imageUpload?.abortUpload?.();
		if ( ! didStopUpload ) {
			abortCurrentRequest();
		}

		recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_response_stopped', {
			stopped_during: didStopUpload ? 'upload' : 'response',
		} );
	}, [ abortCurrentRequest, imageUpload ] );

	const submitChatMessage = useCallback(
		async ( message: string ) => {
			if ( ! message.trim() ) {
				return;
			}

			// Agenttic gates composer sends before `submitComposerMessage`; context cards and
			// the host bridge come here, so gate them too. A blocked send consumes
			// any origin the bridge marked, so it can't label the next send.
			if ( ! beforeSubmit() ) {
				takeActionOrigin( 'send' );
				return;
			}

			await submitComposerMessage( message );

			// Clear only a dispatched message, and only if no new draft replaced it.
			if ( wasLastSendDispatchedRef.current ) {
				setInputValue( ( currentValue ) => ( currentValue === message ? '' : currentValue ) );
			}
		},
		[ beforeSubmit, submitComposerMessage ]
	);

	const submitHostMessage = useCallback(
		async ( message?: string ) => {
			const submittedMessage = typeof message === 'string' ? message : inputValue;
			if ( ! submittedMessage.trim() ) {
				return;
			}

			// Only the host bridge marks its sends; every other path goes out unmarked.
			markActionOrigin( 'send', 'host' );
			await submitChatMessage( submittedMessage );
		},
		[ inputValue, submitChatMessage ]
	);

	return {
		inputValue,
		setInputValue,
		setChatInput,
		imageUpload,
		isUploadingImages,
		uploadError,
		submitComposerMessage,
		submitChatMessage,
		submitHostMessage,
		stopResponse,
	};
}
