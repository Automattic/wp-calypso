import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { useEffect } from 'react';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { Message } from '../types';

type OdieStorageKey = 'chat_id' | 'last_chat_id';

const buildOdieStorageKey = ( key: OdieStorageKey ) => `odie_${ key }`;

const messageEventName = 'odieMessageEvent';
const clearChatEventName = 'clearChatEvent';

export const useGetOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	const { data } = useQuery( {
		queryKey: [ storageKey ],
		queryFn: () => {
			if ( canAccessWpcomApis() ) {
				return wpcomRequest< Record< string, string > >( {
					path: '/me/preferences',
					apiVersion: 'v2',
					apiNamespace: 'wpcom/v2',
				} ).then( ( response ) => response[ storageKey ] );
			}
			return apiFetch< { calypso_preferences: Record< string, string > } >( {
				global: true,
				path: `/help-center/odie/chat/get-last-chat-id`,
			} as APIFetchOptions ).then( ( res ) => res.calypso_preferences[ storageKey ] );
		},
	} );
	return data;
};

export const useSetOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	const client = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( value: string ) => {
			if ( canAccessWpcomApis() ) {
				return wpcomRequest< { calypso_preferences: Record< string, string > } >( {
					path: '/me/preferences',
					apiVersion: 'v2',
					apiNamespace: 'wpcom/v2',
					method: 'PUT',
					body: { calypso_preferences: { [ storageKey ]: value } },
				} );
			}
			return apiFetch< { calypso_preferences: Record< string, string > } >( {
				global: true,
				path: `/help-center/odie/chat/get-last-chat-id`,
				method: 'POST',
				body: JSON.stringify( { [ storageKey ]: value } ),
			} as APIFetchOptions );
		},
		onSuccess: ( response ) => {
			client.setQueryData( [ storageKey ], () => {
				return response.calypso_preferences[ storageKey ];
			} );
		},
	} );

	return mutation.mutate;
};

export const useClearOdieStorage = ( key: OdieStorageKey ) => {
	return useSetOdieStorage( key );
};

export const useOdieStorage = ( key: OdieStorageKey ) => {
	return useGetOdieStorage( key );
};

export const broadcastOdieMessage = ( message: Message, origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: messageEventName,
		message,
		odieClientId: origin,
	} );
};

export const broadcastChatClearance = ( origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: clearChatEventName,
		odieClientId: origin,
	} );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void; clearChat?: () => void },
	listenerClientId: string
) => {
	useEffect( () => {
		const bc = new BroadcastChannel( 'odieChannel' );
		bc.onmessage = ( event ) => {
			const odieClientId = event.data.odieClientId;
			if ( listenerClientId !== odieClientId ) {
				if ( event.data.type === messageEventName && callbacks.addMessage ) {
					callbacks.addMessage( event.data.message );
				} else if ( event.data.type === clearChatEventName && callbacks.clearChat ) {
					callbacks.clearChat();
				}
			}
		};

		return () => {
			bc.close();
		};
	}, [ callbacks, listenerClientId ] );
};
