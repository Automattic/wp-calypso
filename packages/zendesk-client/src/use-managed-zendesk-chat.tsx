import { ThinkingMessage } from '@automattic/agenttic-ui';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import SmoochLibrary from 'smooch';
import { AttachmentMessage } from './components/attachment-message';
import { CSATForm } from './components/csat-form';
import { SMOOCH_INTEGRATION_ID, SMOOCH_INTEGRATION_ID_STAGING } from './constants';
import { ZendeskConversation } from './types';
import { useAttachFileToConversation } from './use-attach-file';
import {
	useAuthenticateZendeskMessaging,
	fetchMessagingAuth,
} from './use-authenticate-zendesk-messaging';
import { isTestModeEnvironment, convertZendeskMessageToAgentticFormat } from './util';
import type { AgentticMessage, ZendeskMessage } from './types';

const SUPPORTED_IMAGE_TYPES = [ 'image/png', 'image/jpg', 'image/jpeg', 'image/gif' ];
const MAX_ATTACHMENTS = 5;

function isSupportedImageType( type: string ) {
	return SUPPORTED_IMAGE_TYPES.includes( type );
}

/** Minimal image preview shape for attachment upload UI (compatible with UseImageUploadResult). */
export type ZendeskImagePreview = {
	id: string;
	url: string;
	name: string;
	alt: string;
	mime_type: string;
	file: File;
};

/** Minimal uploading image shape (compatible with UseImageUploadResult.uploadingImages). */
export type ZendeskUploadingImage = {
	id: string;
	url?: string;
	name?: string;
};

type ConversationData = {
	conversation: {
		id: string;
	};
};

let smoochContainer: HTMLDivElement | null = null;

function getSmoochContainer(): HTMLDivElement | null {
	if ( typeof document === 'undefined' ) {
		return null;
	}

	const existing = document.querySelector< HTMLDivElement >( '.smooch-container' );
	if ( existing ) {
		smoochContainer = existing;
	} else if ( ! smoochContainer ) {
		smoochContainer = document.createElement( 'div' );
		smoochContainer.className = 'smooch-container';
	}

	// Keep the container hidden since we're using embedded mode.
	smoochContainer.style.display = 'none';
	smoochContainer.style.position = 'absolute';
	smoochContainer.style.top = '0';
	smoochContainer.style.left = '0';
	smoochContainer.style.width = '100%';
	smoochContainer.style.height = '100%';
	smoochContainer.style.zIndex = '1000';

	if ( ! document.body.contains( smoochContainer ) ) {
		document.body.appendChild( smoochContainer );
	}

	return smoochContainer;
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

const playNotificationSound = () => {
	// @ts-expect-error expected because of fallback webkitAudioContext
	const audioContext = new ( window.AudioContext || window.webkitAudioContext )();

	const duration = 0.7;
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	// Configure oscillator
	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime( 660, audioContext.currentTime );

	// Configure gain for a smoother fade-out
	gainNode.gain.setValueAtTime( 0.3, audioContext.currentTime );
	gainNode.gain.exponentialRampToValueAtTime( 0.001, audioContext.currentTime + duration );

	// Connect & start
	oscillator.connect( gainNode );
	gainNode.connect( audioContext.destination );
	oscillator.start();
	oscillator.stop( audioContext.currentTime + duration );
};
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
	const { state } = useLocation();
	const conversationId = state?.conversationId;
	const [ conversation, setConversation ] = useState< ZendeskConversation | undefined >();
	const [ typingStatus, setTypingStatus ] = useState< Record< string, boolean > >( {} );
	const [ connectionStatus, setConnectionStatus ] = useState<
		'connected' | 'disconnected' | 'reconnecting' | undefined
	>( undefined );
	const [ pendingImages, setPendingImages ] = useState< ZendeskImagePreview[] >( [] );

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
				playNotificationSound();
				Smooch?.getConversationById( data.conversation.id ).then( setConversation );
				//Smooch?.loadConversation( data.conversation.id );
			}
		},
		[ Smooch, setConversation, conversation?.id ]
	);

	const disconnectedListener = useCallback( () => {
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
				},
			} ).then( ( conversation ) => {
				setConversation( conversation );
				navigate( '/zendesk', { state: { conversationId: conversation.id }, replace: true } );
				Smooch.loadConversation( conversation.id );
			} );
		}
	}, [ Smooch, conversationId, navigate, conversation, Smooch?.render ] );

	const currentTypingStatus = typingStatus[ conversation?.id ?? '' ];

	const sendFeedbackMessage = useCallback(
		( score: 'good' | 'bad' ) => {
			if ( ! conversation?.id || ! Smooch ) {
				return;
			}

			const text =
				score === 'good'
					? __( 'Good', '__i18n_text_domain__' )
					: __( 'Needs improvement', '__i18n_text_domain__' );

			const messageToSend = {
				type: 'text',
				text,
				payload: JSON.stringify( { csat_rating: score.toUpperCase() } ),
				metadata: {
					rated: true,
				},
			};

			Smooch.sendMessage( messageToSend, conversation.id );
		},
		[ Smooch, conversation?.id ]
	);

	const agentticMessages = useMemo( () => {
		const rawMessages = conversation?.messages ?? [];
		const hasRated = rawMessages.some( ( msg ) => msg.metadata?.rated === true );

		const messages = rawMessages.map( ( message ): AgentticMessage => {
			const isCSAT =
				message.source?.type === 'zd:surveys' && message.actions && message.actions.length > 0;

			if ( isCSAT && ! hasRated ) {
				const ticketId = message.actions?.[ 0 ]?.metadata?.ticket_id ?? null;

				return {
					id: message.id || crypto.randomUUID(),
					role: 'agent',
					content: [
						{
							type: 'text',
							text: __(
								'Please help us improve. How would you rate your support experience?',
								'__i18n_text_domain__'
							),
						},
						{
							type: 'component',
							component: () => (
								<CSATForm ticketId={ ticketId } onSendFeedback={ sendFeedbackMessage } />
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
				( message.type === 'file' ||
					message.type === 'image' ||
					message.type === 'image-placeholder' ) &&
				message.mediaUrl;

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
			return [
				...messages,
				{
					id: 'thinking_message_' + messages.length,
					role: 'agent',
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
				},
			];
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
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'message:received', getUnreadListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'disconnected', disconnectedListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'reconnecting', reconnectingListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'connected', connectedListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'typing:stop', typingStopListener );
				// @ts-expect-error -- 'off' is not part of the def.
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
		const toAdd = files
			.filter( ( f ) => isSupportedImageType( f.type ) )
			.slice( 0, MAX_ATTACHMENTS );
		setPendingImages( ( prev ) => {
			const next = [ ...prev ];
			for ( const file of toAdd ) {
				if ( next.length >= MAX_ATTACHMENTS ) {
					break;
				}
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
		setPendingImages( ( prev ) => {
			const item = prev.find( ( p ) => p.id === image.id );
			if ( item?.url ) {
				URL.revokeObjectURL( item.url );
			}
			return prev.filter( ( p ) => p.id !== image.id );
		} );
	}, [] );

	const imageUpload =
		conversation?.id && clientId && authData?.jwt
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
						} ).then( () => {
							URL.revokeObjectURL( item.url );
						} )
					)
				).then( () => {
					// Refetch after a short delay so the backend has time to add the file message to the conversation.
					const refetch = () =>
						Smooch.getConversationById( conversationId ).then( setConversation );
					refetch();
					setTimeout( refetch, 1500 );
				} );
			}
			if ( conversation?.id && Smooch ) {
				const messageToSend = {
					type: 'text',
					text: message || '',
				};
				setConversation( ( prev ) =>
					prev ? { ...prev, messages: [ ...prev.messages, messageToSend as ZendeskMessage ] } : prev
				);
				Smooch.sendMessage( messageToSend, conversation.id );
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

	return {
		typingStatus,
		isProcessing: isSettingUpSmooch,
		conversation,
		connectionStatus,
		agentticMessages,
		isLoadingConversation: isSettingUpSmooch || ! conversation,
		onTypingStatusChange: ( typingStatus: boolean ) => {
			if ( typingStatus ) {
				Smooch?.startTyping( conversation?.id );
			} else {
				Smooch?.stopTyping( conversation?.id );
			}
		},
		onSubmit: onSubmitWithAttachments,
		imageUpload,
	};
};

export const useGetZendeskConversations = ( enabled: boolean ) => {
	const { data: Smooch, isLoading: isSettingUpSmooch } = useSmooch( enabled );
	return { conversations: Smooch?.getConversations() ?? [], isLoading: isSettingUpSmooch };
};
