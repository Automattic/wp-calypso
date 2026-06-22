import {
	NoticeConfig,
	ThinkingMessage,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@automattic/agenttic-ui';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	createInterpolateElement,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SmoochLibrary from 'smooch';
import { AttachmentMessage } from './components/attachment-message';
import { CSATForm } from './components/csat-form';
import {
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
	ZENDESK_CUSTOM_FIELD_AI_CHAT_SESSION_ID,
	ZENDESK_CUSTOM_FIELD_AI_MESSAGE_ID,
} from './constants';
import {
	ConversationData,
	ZendeskConversation,
	ZendeskImagePreview,
	ZendeskUploadingImage,
	QueuedMessage,
} from './types';
import { useAttachFileToConversation } from './use-attach-file';
import {
	useAuthenticateZendeskMessaging,
	fetchMessagingAuth,
} from './use-authenticate-zendesk-messaging';
import { useConnectionStatusNotice } from './use-connection-status-notice';
import {
	convertZendeskMessageToAgentticFormat,
	getSmoochContainer,
	isSupportedImageType,
	isTestModeEnvironment,
	MAX_ATTACHMENTS,
	playNotificationSound,
	SUPPORTED_IMAGE_TYPES,
} from './util';
import type { AgentticMessage, ZendeskMessage, ZendeskContentType } from './types';

function sortMessagesByTimestamp( messages: ZendeskMessage[] ) {
	return messages.slice( 0 ).sort( ( a, b ) => {
		// Give precedence to the local timestamp, if it exists.
		// It's more accurate than the server timestamp because it's independent of connection status.
		const aTimestamp = a.metadata?.local_timestamp || a.received;
		const bTimestamp = b.metadata?.local_timestamp || b.received;

		return aTimestamp - bTimestamp;
	} );
}

function useSmooch( enabled = true ) {
	const queryClient = useQueryClient();
	const { data: authData, isFetching: isAuthenticatingZendeskMessaging } =
		useAuthenticateZendeskMessaging( enabled, 'zendesk', false );
	const jwt = authData?.jwt;
	const externalId = authData?.externalId;

	const smoochQuery = useQuery( {
		queryKey: [ 'smooch', jwt, externalId ],
		queryFn: () => {
			const isTestMode = isTestModeEnvironment();
			const container = getSmoochContainer();
			if ( ! container ) {
				throw new Error( 'Smooch container is unavailable.' );
			}

			SmoochLibrary.render( container );
			return SmoochLibrary.init( {
				integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
				delegate: {
					async onInvalidAuth() {
						recordTracksEvent( 'calypso_smooch_messenger_auth_error' );

						await queryClient.invalidateQueries( {
							queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode, false ],
						} );
						const authData = await queryClient.fetchQuery( {
							queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode, false ],
							queryFn: () => fetchMessagingAuth( 'zendesk', false ),
						} );

						return authData.jwt;
					},
				},
				embedded: true,
				soundNotificationEnabled: false,
				externalId,
				jwt,
			} ).then( () => {
				return SmoochLibrary;
			} );
		},
		staleTime: Infinity,
		enabled: !! jwt && !! externalId && enabled,
		meta: {
			persist: false,
		},
	} );

	return { ...smoochQuery, isLoading: isAuthenticatingZendeskMessaging || smoochQuery.isFetching };
}

type UserMessageContent = {
	type: ZendeskContentType;
	text: string;
	payload?: string;
	metadata?: Record< string, unknown >;
};

function createUserMessage( content: UserMessageContent ): ZendeskMessage {
	return {
		...content,
		id: crypto.randomUUID(),
		role: 'user',
		received: Date.now() / 1000,
		metadata: {
			...content.metadata,
			local_timestamp: Date.now() / 1000,
			temporary_id: crypto.randomUUID(),
		},
	} as ZendeskMessage;
}

/**
 * Creates an enhanced ZendeskMessage from the given content and sends it via Smooch.
 * Automatically adds id, role, received timestamp, and temporary_id metadata.
 * @returns The enhanced message (for optimistic updates) and a `sent` promise that
 *          resolves when the server acknowledges the message, or rejects after 5 s.
 */
function sendMessage(
	content: UserMessageContent,
	conversationId: string,
	Smooch: typeof SmoochLibrary
) {
	const messageToSend = createUserMessage( content );

	const sent = new Promise< ZendeskMessage >( ( resolve, reject ) => {
		Smooch?.sendMessage( messageToSend, conversationId );
		const timeout = setTimeout( () => {
			reject( new Error( 'Message not sent' ) );
		}, 5000 );
		function onMessageSent( message: ZendeskMessage ) {
			if ( message.metadata?.temporary_id === messageToSend.metadata?.temporary_id ) {
				Smooch.off( 'message:sent', onMessageSent );
				resolve( message );
				clearTimeout( timeout );
			}
		}
		Smooch?.on( 'message:sent', onMessageSent as any );
	} );

	return { message: messageToSend, sent };
}

/**
 * Returns a complete API for managing a Zendesk chat.
 * @returns An object with the following properties:
 * - typingStatus: The status of the typing.
 * - clientId: The ID of the client.
 * - conversation: The conversation.
 * - connectionStatus: The status of the connection.
 * - agentticMessages: The messages in the conversation in Agenttic-compatible format.
 * - sendMessage: A function to send a message to the conversation.
 */
export const useManagedZendeskChat = () => {
	const [ attachmentsNotice, setAttachmentNotice ] = useState< NoticeConfig | undefined >();
	const { state } = useLocation();
	const conversationId = state?.conversationId;
	const startedFromChatId = state?.startedFromChatId;
	const startedFromMessageId = state?.startedFromMessageId;
	const [ conversation, setConversation ] = useState< ZendeskConversation | undefined >();
	const [ typingStatus, setTypingStatus ] = useState< Record< string, boolean > >( {} );
	const [ connectionStatus, setConnectionStatus ] = useState<
		'connected' | 'disconnected' | 'reconnecting' | undefined
	>( undefined );
	const [ pendingImages, setPendingImages ] = useState< ZendeskImagePreview[] >( [] );
	const refetchTimeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const messageQueueRef = useRef< QueuedMessage[] >( [] );
	const connectionStatusRef = useRef( connectionStatus );
	connectionStatusRef.current = connectionStatus;
	const hadDisconnectRef = useRef( false );

	const connectionNotice = useConnectionStatusNotice( connectionStatus, true );

	const { data: authData } = useAuthenticateZendeskMessaging( true, 'zendesk', false );
	const { data: Smooch, isLoading: isSettingUpSmooch } = useSmooch();
	const { isPending: isAttachingFile, mutateAsync: attachFileToConversation } =
		useAttachFileToConversation();

	const clientId = useMemo( () => {
		const messages = conversation?.messages ?? [];
		const msg = messages.find( ( m ) => m.source?.type === 'web' && m.source?.id ) as
			| ZendeskMessage
			| undefined;
		return msg?.source?.id ?? '';
	}, [ conversation?.messages ] );

	const getUnreadListener = useCallback(
		( message: ZendeskMessage, data: { conversation: { id: string } } ) => {
			if ( data.conversation.id === conversation?.id ) {
				if ( message.sendStatus !== 'sending' ) {
					playNotificationSound();
				}
				//Smooch?.getConversationById( data.conversation.id ).then( setConversation );
				//Smooch?.loadConversation( data.conversation.id );
				setConversation( ( prev ) =>
					prev ? { ...prev, messages: [ ...prev.messages, message ] } : prev
				);
			}
		},
		[ setConversation, conversation?.id ]
	);

	const hasCSAT = useMemo( () => {
		const messages = conversation?.messages ?? [];
		return messages.some( ( msg ) => msg.metadata?.type === 'csat' );
	}, [ conversation?.messages ] );

	const disconnectedListener = useCallback( () => {
		hadDisconnectRef.current = true;
		setConnectionStatus( 'disconnected' );
		recordTracksEvent( 'calypso_smooch_messenger_disconnected' );
	}, [ setConnectionStatus ] );

	const reconnectingListener = useCallback( () => {
		setConnectionStatus( 'reconnecting' );
		recordTracksEvent( 'calypso_smooch_messenger_reconnecting' );
	}, [ setConnectionStatus ] );

	const typingStartListener = useCallback(
		( { conversation }: ConversationData ) => {
			setTypingStatus( ( typingStatus ) => ( { ...typingStatus, [ conversation.id ]: true } ) );
		},
		[ setTypingStatus ]
	);
	const typingStopListener = useCallback(
		( { conversation }: ConversationData ) => {
			setTypingStatus( ( typingStatus ) => ( { ...typingStatus, [ conversation.id ]: false } ) );
		},
		[ setTypingStatus ]
	);

	const connectedListener = useCallback( () => {
		// We only want to revert the connection status to connected if it was disconnected before.
		// We don't want a "connected" status on page load, it's only useful as a sign of a recovered connection.
		if ( connectionStatus ) {
			setConnectionStatus( 'connected' );
			recordTracksEvent( 'calypso_smooch_messenger_connected' );
		}
	}, [ setConnectionStatus, connectionStatus ] );

	const navigate = useNavigate();

	useEffect( () => {
		if ( ! Smooch || conversation ) {
			return;
		}

		if ( conversationId ) {
			Smooch.getConversationById( conversationId ).then( setConversation );
			Smooch.loadConversation( conversationId );
		} else {
			Smooch.createConversation( {
				metadata: {
					createdAt: Date.now(),
					started_from: 'chat',
					chat_session_id: startedFromChatId,
					message_id: startedFromMessageId,
					[ `zen:ticket_field:${ ZENDESK_CUSTOM_FIELD_AI_MESSAGE_ID }` ]: startedFromMessageId,
					[ `zen:ticket_field:${ ZENDESK_CUSTOM_FIELD_AI_CHAT_SESSION_ID }` ]: startedFromChatId,
				},
			} ).then( ( conversation ) => {
				setConversation( conversation );
				navigate( '/zendesk', { state: { conversationId: conversation.id }, replace: true } );
				Smooch.loadConversation( conversation.id );
			} );
		}
	}, [ Smooch, conversationId, navigate, conversation, Smooch?.render, startedFromChatId ] );

	const currentTypingStatus = typingStatus[ conversation?.id ?? '' ];

	const sendFeedbackMessage = useCallback(
		( score: 'good' | 'bad' ) => {
			if ( ! conversation?.id || ! Smooch ) {
				return;
			}

			const text =
				score === 'good'
					? __( 'Good 👍', '__i18n_text_domain__' )
					: __( 'Needs improvement 👎', '__i18n_text_domain__' );

			sendMessage(
				{
					type: 'text',
					text,
					payload: JSON.stringify( { csat_rating: score.toUpperCase() } ),
					metadata: { rated: true },
				},
				conversation.id,
				Smooch
			);
		},
		[ conversation?.id, Smooch ]
	);

	const agentticMessages = useMemo( () => {
		const rawMessages = sortMessagesByTimestamp( conversation?.messages ?? [] );
		const ratingMessage = rawMessages.find( ( msg ) => msg.metadata?.rated === true );
		const hasRated = ratingMessage !== undefined;
		let score: 'GOOD' | 'BAD' | null = null;

		if ( hasRated && ratingMessage.payload ) {
			try {
				score = JSON.parse( ratingMessage.payload ).csat_rating ?? null;
			} catch {
				score = null;
			}
		}

		let ticketId: number | null = null;
		const messages = rawMessages.map( ( message ): AgentticMessage => {
			const isCSAT = message.metadata?.type === 'csat';

			if ( isCSAT ) {
				ticketId = message.actions?.[ 0 ]?.metadata?.ticket_id ?? null;
				return {
					...convertZendeskMessageToAgentticFormat( message ),
					content: [
						{
							type: 'text',
							text: __(
								'Please help us improve. How would you rate your experience?',
								'__i18n_text_domain__'
							),
						},
					],
					actions: ! hasRated
						? message.actions?.map( ( action ) => {
								const label =
									action.metadata.score === 'GOOD'
										? __( 'Good 👍', '__i18n_text_domain__' )
										: __( 'Needs improvement 👎', '__i18n_text_domain__' );
								return {
									...action,
									label,
									tooltip: label,
									icon: action.metadata.score === 'GOOD' ? <ThumbsUpIcon /> : <ThumbsDownIcon />,
									onClick: () => {
										sendFeedbackMessage( action.metadata.score === 'GOOD' ? 'good' : 'bad' );
									},
									pressed: action.metadata.score === score,
								};
						  } ) ?? []
						: [],
				};
			}

			const isCSATForm =
				message.type === 'form' &&
				message.fields?.some( ( field ) => field.name === 'csat_comment' );

			if ( isCSATForm && score ) {
				return {
					id: message.id || crypto.randomUUID(),
					role: 'agent',
					content: [
						{
							type: 'component',
							component: () => (
								<CSATForm
									preDeterminedScore={ score === 'GOOD' ? 'good' : 'bad' }
									ticketId={ ticketId }
									onSendFeedback={ sendFeedbackMessage }
								/>
							),
						},
					],
					timestamp: message.received,
					archived: false,
					showIcon: true,
					icon: message.avatarUrl,
					disabled: false,
				};
			}

			const isAttachment =
				( message.type === 'file' || message.type === 'image' ) && message.mediaUrl;

			if ( isAttachment && message.mediaUrl ) {
				const mediaUrl = message.mediaUrl;
				return {
					id: message.id || crypto.randomUUID(),
					role: message.role === 'business' ? 'agent' : 'user',
					content: [
						{
							type: 'component',
							component: () => (
								<AttachmentMessage
									mediaUrl={ mediaUrl }
									type={ message.type as 'file' | 'image' | 'image-placeholder' }
									altText={ message.altText }
								/>
							),
						},
					],
					timestamp: message.received,
					archived: false,
					showIcon: true,
					icon: message.avatarUrl,
					disabled: false,
				};
			}

			return convertZendeskMessageToAgentticFormat( message );
		} );

		if ( currentTypingStatus ) {
			messages.push( {
				id: 'thinking_message_' + messages.length,
				role: 'agent',
				timestamp: new Date().getTime() / 1000,
				archived: false,
				showIcon: true,
				content: [
					{
						type: 'component',
						component: () => (
							<div className="agents-manager-typing-placeholder">
								<ThinkingMessage content={ __( 'Typing…', '__i18n_text_domain__' ) } />
							</div>
						),
					},
				],
			} );
		}
		if (
			conversation?.metadata?.started_from === 'chat' &&
			conversation?.metadata?.chat_session_id
		) {
			messages.unshift( {
				id: 'transfer_message',
				role: 'agent',
				timestamp: new Date().getTime() / 1000,
				archived: false,
				showIcon: true,
				content: [
					{
						type: 'component',
						component: () => (
							<div className="agents-manager-transfer-message">
								<div>
									{ createInterpolateElement(
										__( 'Started from <a>another chat</a>', '__i18n_text_domain__' ),
										{
											a: (
												<Link
													to={ `/chat?sessionId=${ conversation?.metadata?.chat_session_id }` }
												/>
											),
										}
									) }
								</div>
							</div>
						),
					},
				],
			} );
		}
		return messages;
	}, [ conversation, currentTypingStatus, sendFeedbackMessage ] );

	useEffect( () => {
		if ( Smooch ) {
			Smooch.on( 'message:received', getUnreadListener );
			Smooch.on( 'disconnected', disconnectedListener );
			Smooch.on( 'reconnecting', reconnectingListener );
			Smooch.on( 'connected', connectedListener );
			Smooch.on( 'typing:start', typingStartListener );
			Smooch.on( 'typing:stop', typingStopListener );

			return () => {
				Smooch.off?.( 'message:received', getUnreadListener );
				Smooch.off?.( 'disconnected', disconnectedListener );
				Smooch.off?.( 'reconnecting', reconnectingListener );
				Smooch.off?.( 'connected', connectedListener );
				Smooch.off?.( 'typing:stop', typingStopListener );
				Smooch.off?.( 'typing:start', typingStartListener );
			};
		}
	}, [
		setConnectionStatus,
		typingStartListener,
		typingStopListener,
		getUnreadListener,
		//getUnreadNotifications,
		disconnectedListener,
		reconnectingListener,
		connectedListener,
		Smooch,
	] );

	const handleFilesSelected = useCallback( async ( files: File[] ) => {
		setAttachmentNotice( undefined );

		setPendingImages( ( prev ) => {
			const uploadedImages = files.filter( ( f ) => isSupportedImageType( f.type ) );
			const toAdd = uploadedImages.slice( 0, MAX_ATTACHMENTS - prev.length );
			const shouldWarnAboutMaxAttachments = uploadedImages.length + prev.length > MAX_ATTACHMENTS;

			if ( shouldWarnAboutMaxAttachments ) {
				setAttachmentNotice( {
					status: 'warning',
					message: __( 'Only five images can be added at a time.', '__i18n_text_domain__' ),
				} );
			}

			const next = [ ...prev ];

			for ( const file of toAdd ) {
				if ( next.some( ( p ) => p.name === file.name && p.file.size === file.size ) ) {
					continue;
				}
				next.push( {
					id: crypto.randomUUID(),
					url: URL.createObjectURL( file ),
					name: file.name,
					alt: '',
					mime_type: file.type,
					file,
				} );
			}
			return next;
		} );
	}, [] );

	const handleRemoveImage = useCallback( ( image: { id: string } ) => {
		setAttachmentNotice( undefined );
		setPendingImages( ( prev ) => {
			const item = prev.find( ( p ) => p.id === image.id );
			if ( item?.url ) {
				URL.revokeObjectURL( item.url );
			}
			return prev.filter( ( p ) => p.id !== image.id );
		} );
	}, [] );

	const isDisconnectedStatus =
		connectionStatus === 'disconnected' || connectionStatus === 'reconnecting';

	const imageUpload =
		conversation?.id && clientId && authData?.jwt && ! isDisconnectedStatus
			? {
					pendingImages,
					uploadingImages: [] as ZendeskUploadingImage[],
					isUploadingImages: isAttachingFile,
					handleFilesSelected,
					handleRemoveImage: handleRemoveImage as ( image: unknown ) => void,
					uploadImagesToWordPress: () => Promise.resolve( [] as never[] ),
			  }
			: undefined;

	const onSubmitWithAttachments = useCallback(
		( message: string ) => {
			const toUpload = pendingImages;
			setPendingImages( [] );
			setAttachmentNotice( undefined );

			const isDisconnected =
				connectionStatusRef.current === 'disconnected' ||
				connectionStatusRef.current === 'reconnecting';

			if ( isDisconnected && conversation?.id && message.trim().length > 0 ) {
				messageQueueRef.current.push( { text: message.trim() } );
				const messageToSend = createUserMessage( { type: 'text', text: message.trim() } );
				setConversation( ( prev ) =>
					prev ? { ...prev, messages: [ ...prev.messages, messageToSend ] } : prev
				);
				return;
			}

			if ( toUpload.length > 0 && conversation?.id && authData?.jwt && clientId && Smooch ) {
				const conversationId = conversation.id;
				Promise.all(
					toUpload.map( ( item ) =>
						attachFileToConversation( {
							authData: {
								isLoggedIn: true,
								jwt: authData.jwt,
								externalId: authData.externalId,
							},
							clientId,
							conversationId: conversation.id,
							file: item.file,
						} ).then( ( response: Response ) => {
							if ( response && typeof response === 'object' && 'ok' in response && ! response.ok ) {
								throw new Error( 'Failed to upload attachment' );
							}
							URL.revokeObjectURL( item.url );
						} )
					)
				)
					.then( () => {
						const refetch = () =>
							Smooch.getConversationById( conversationId ).then( setConversation );
						refetch();
						refetchTimeoutRef.current = setTimeout( refetch, 1500 );
					} )
					.catch( ( error: unknown ) => {
						// eslint-disable-next-line no-console
						console.error( 'Error uploading Zendesk chat attachments', error );
						try {
							recordTracksEvent( 'zendesk_chat_file_upload_failed' );
						} catch {
							// Swallow analytics errors to avoid affecting user flow.
						}
						setPendingImages( ( prev ) => [ ...toUpload, ...prev ] );
					} );
			}
			const hasText = message.trim().length > 0;
			if ( conversation?.id && Smooch && hasText ) {
				sendMessage( { type: 'text', text: message.trim() }, conversation.id, Smooch );
			}
		},
		[
			pendingImages,
			conversation?.id,
			authData?.jwt,
			authData?.externalId,
			clientId,
			Smooch,
			attachFileToConversation,
		]
	);

	useEffect( () => {
		if (
			connectionStatus !== 'connected' ||
			! hadDisconnectRef.current ||
			! Smooch ||
			! conversation?.id
		) {
			return;
		}

		hadDisconnectRef.current = false;
		const conversationId = conversation.id;
		const queue = [ ...messageQueueRef.current ];
		messageQueueRef.current = [];

		const flushAndResync = async () => {
			for ( const entry of queue ) {
				if ( entry.text.length > 0 ) {
					try {
						await sendMessage( { type: 'text', text: entry.text }, conversationId, Smooch ).sent;
					} catch {
						// Message failed to send — it was already shown optimistically, and the
						// resync below will reconcile the conversation state with the server.
					}
				}
			}

			if ( queue.length > 0 ) {
				recordTracksEvent( 'calypso_smooch_messenger_queue_flushed', {
					queued_messages: queue.length,
				} );
			}

			return Smooch.getConversationById( conversationId ).then( setConversation );
		};

		flushAndResync();
	}, [ connectionStatus, Smooch, conversation?.id ] );

	useEffect( () => {
		return () => {
			if ( refetchTimeoutRef.current !== null ) {
				clearTimeout( refetchTimeoutRef.current );
				refetchTimeoutRef.current = null;
			}
		};
	}, [] );

	return {
		typingStatus,
		isProcessing: isSettingUpSmooch,
		conversation,
		connectionStatus,
		notice: connectionNotice || attachmentsNotice,
		agentticMessages,
		isLoadingConversation: isSettingUpSmooch || ! conversation,
		hasInteractionEnded: hasCSAT,
		onTypingStatusChange: ( typingStatus: boolean ) => {
			if ( typingStatus ) {
				Smooch?.startTyping( conversation?.id );
			} else {
				Smooch?.stopTyping( conversation?.id );
			}
		},
		onSubmit: onSubmitWithAttachments,
		supportedImageTypes: SUPPORTED_IMAGE_TYPES,
		imageUpload,
	};
};

export const useGetZendeskConversations = ( enabled: boolean ) => {
	const { data: Smooch, isLoading: isSettingUpSmooch } = useSmooch( enabled );
	return { conversations: Smooch?.getConversations() ?? [], isLoading: isSettingUpSmooch };
};
