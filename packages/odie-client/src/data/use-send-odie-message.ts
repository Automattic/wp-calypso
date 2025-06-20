/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from 'react';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	ODIE_RATE_LIMIT_MESSAGE,
	ODIE_EMAIL_FALLBACK_MESSAGE,
	ODIE_ERROR_MESSAGE_NON_ELIGIBLE,
} from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from '../hooks';
import { generateUUID, getOdieIdFromInteraction, getIsRequestingHumanSupport } from '../utils';
import { useManageSupportInteraction, broadcastOdieMessage } from '.';
import type { Chat, Message, ReturnedChat } from '../types';

const BASE_URL = '/odie';

const getErrorMessageForSiteIdAndInternalMessageId = (
	selectedSiteId: number | null | undefined,
	internal_message_id: string
): Message => {
	return {
		content: ODIE_ERROR_MESSAGE_NON_ELIGIBLE,
		internal_message_id,
		role: 'bot',
		type: 'message',
		context: {
			site_id: selectedSiteId ?? null,
			flags: {
				forward_to_human_support: true,
				canned_response: false,
				hide_disclaimer_content: false,
				show_contact_support_msg: true,
				show_ai_avatar: true,
				is_error_message: true,
			},
		},
	};
};

/**
 * Sends a new message to ODIE.
 * If the chat_id is not set, it will create a new chat and send a message to the chat.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = ( api_version: string | null = '2' ) => {
	// QUICK FIX TODO: Remove this or improve it later.
	const user = useSelector( getCurrentUser ) as unknown as { ID: number | null } | null;

	const userId = user?.ID ?? null;

	const { currentSupportInteraction, odieId } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		const currentSupportInteraction = store.getCurrentSupportInteraction();
		const odieId = getOdieIdFromInteraction( currentSupportInteraction );

		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
			odieId,
		};
	}, [] );

	const { addEventToInteraction } = useManageSupportInteraction();
	const newConversation = useCreateZendeskConversation();
	const internal_message_id = generateUUID();
	const queryClient = useQueryClient();
	const [ shouldCreateConversation, setShouldCreateConversation ] = useState< {
		createdFrom?: string;
		isFromError?: boolean;
		trigger: boolean;
	} >( { isFromError: false, trigger: false } );

	useEffect( () => {
		const { createdFrom, isFromError, trigger } = shouldCreateConversation;

		if ( trigger ) {
			newConversation( { createdFrom, isFromError } );
			setShouldCreateConversation( { createdFrom: undefined, isFromError: false, trigger: false } );
		}
	}, [ newConversation, shouldCreateConversation ] );

	const {
		botNameSlug,
		selectedSiteId,
		version,
		setChat,
		odieBroadcastClientId,
		setChatStatus,
		setExperimentVariationName,
		chat,
		isUserEligibleForPaidSupport,
		canConnectToZendesk,
		forceEmailSupport,
	} = useOdieAssistantContext();

	/*
		Adds a message to the chat.
		If the message is a request for human support, it will escalate the chat to human support, if eligible.
		If email support is forced, it will add an email fallback message.
	*/
	const addMessage = ( {
		message,
		props = {},
		isFromError = false,
	}: {
		message: Message | Message[];
		props?: Partial< Chat >;
		isFromError: boolean;
	} ) => {
		if ( ! Array.isArray( message ) ) {
			if ( getIsRequestingHumanSupport( message ) ) {
				if ( forceEmailSupport ) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						...props,
						messages: [ ...prevChat.messages, ...[ ODIE_EMAIL_FALLBACK_MESSAGE ] ],
						status: 'loaded',
					} ) );
					broadcastOdieMessage( message, odieBroadcastClientId );
					return;
				} else if ( ! chat.conversationId && canConnectToZendesk && isUserEligibleForPaidSupport ) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						...props,
					} ) );

					// Trigger the `newConversation` mutation to be run inside `useEffect`, so the latest `chat` state is used.
					setShouldCreateConversation( {
						trigger: true,
						createdFrom: 'automatic_escalation',
						isFromError,
					} );
					broadcastOdieMessage( message, odieBroadcastClientId );
					return;
				}
			}
		}

		setChat( ( prevChat ) => ( {
			...prevChat,
			...props,
			messages: [ ...prevChat.messages, ...( Array.isArray( message ) ? message : [ message ] ) ],
			status: 'loaded',
		} ) );
	};

	const fetchOdieMessage = async ( message: Message ): Promise< ReturnedChat > => {
		const chatIdSegment = odieId ? `/${ odieId }` : '';

		// Version 1 (default): current behavior
		if ( ! api_version || api_version === '1' ) {
			return canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'POST',
						path: `${ BASE_URL }/chat/${ botNameSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						body: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId },
						},
				  } )
				: await apiFetch( {
						path: `/help-center${ BASE_URL }/chat/${ botNameSlug }${ chatIdSegment }`,
						method: 'POST',
						data: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId },
						},
				  } );
		}

		// Version 2: ai/gent endpoint, all params in body, user_id: '0'
		if ( api_version === '2' ) {
			const rpcPayload = {
				jsonrpc: '2.0',
				id: String( Date.now() ),
				method: 'tasks/send',
				params: {
					message: {
						role: 'user',
						parts: [
							{
								type: 'text',
								text: message.content,
							},
						],
					},
					constructor_arguments: {
						chat_id: odieId || undefined,
						message: message.content,
						agent_version: version ?? null,
						blog_id: selectedSiteId,
						user_id: userId || 0,
						agent_slug: botNameSlug,
					},
				},
			};

			const response = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'POST',
						path: '/ai/agent/configurable',
						apiNamespace: 'wpcom/v2',
						body: rpcPayload,
				  } )
				: await apiFetch( {
						path: '/help-center/ai/agent/configurable',
						method: 'POST',
						data: rpcPayload,
				  } );

			const responseTyped = response as {
				result: {
					status: {
						message: {
							parts: Array< {
								data: ReturnedChat;
							} >;
						};
					};
				};
			};

			// Adapt to new response structure
			const data = responseTyped?.result?.status?.message?.parts?.[ 0 ]?.data;

			return data;
		}

		// Default fallback
		return Promise.reject( new Error( `Unknown version: ${ version }` ) );
	};

	return useMutation< ReturnedChat, Error, Message >( {
		mutationFn: fetchOdieMessage,
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		onSuccess: ( returnedChat ) => {
			if (
				! returnedChat.messages ||
				returnedChat.messages.length === 0 ||
				! returnedChat.messages[ 0 ].content
			) {
				// Handle empty/error response based on user eligibility
				if ( isUserEligibleForPaidSupport && canConnectToZendesk ) {
					// User is eligible for premium support - transfer to Zendesk
					// Note: newConversation will add the ODIE_ON_ERROR_TRANSFER_MESSAGE automatically
					newConversation( {
						createdFrom: 'empty_response_error',
						isFromError: true,
					} );
				} else {
					// User is not eligible for premium support - show error message with support buttons
					const errorMessage = getErrorMessageForSiteIdAndInternalMessageId(
						selectedSiteId,
						internal_message_id
					);

					addMessage( { message: errorMessage, props: {}, isFromError: true } );
				}
				return;
			}

			if ( ! odieId ) {
				addEventToInteraction.mutate( {
					interactionId: currentSupportInteraction!.uuid,
					eventData: {
						event_external_id: returnedChat.chat_id.toString(),
						event_source: 'odie',
					},
				} );
			}

			const botMessage: Message = {
				message_id: returnedChat.messages[ 0 ].message_id,
				internal_message_id,
				content: returnedChat.messages[ 0 ].content,
				role: 'bot',
				simulateTyping: returnedChat.messages[ 0 ].simulateTyping,
				type: 'message',
				context: returnedChat.messages[ 0 ].context,
			};
			setExperimentVariationName( returnedChat.experiment_name );
			addMessage( {
				message: botMessage,
				props: { odieId: returnedChat.chat_id },
				isFromError: false,
			} );
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: [ 'odie-chat', botNameSlug, odieId ] } );
		},
		onError: ( error ) => {
			const isRateLimitError = error.message.includes( '429' );

			if ( isRateLimitError ) {
				// Handle rate limit error with standard rate limit message
				const message: Message = { ...ODIE_RATE_LIMIT_MESSAGE, internal_message_id };
				addMessage( { message, props: {}, isFromError: true } );
			} else if ( isUserEligibleForPaidSupport && canConnectToZendesk ) {
				// User is eligible for premium support - transfer to Zendesk
				newConversation( {
					createdFrom: 'api_error',
					isFromError: true,
				} );
			} else {
				// User is not eligible for premium support - show error message with support buttons
				const errorMessage: Message = getErrorMessageForSiteIdAndInternalMessageId(
					selectedSiteId,
					internal_message_id
				);

				addMessage( { message: errorMessage, props: {}, isFromError: true } );
			}
		},
	} );
};
