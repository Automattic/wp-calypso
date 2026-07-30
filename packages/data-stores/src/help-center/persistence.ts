import {
	ONE_WEEK_PERSISTENCE_STORAGE_KEY,
	oneWeekPersistenceStorage,
} from '../plugins/one-week-persistence-config';
import { STORE_KEY } from './constants';
import type {
	LoggedOutOdieChat,
	LoggedOutOdieChatHandoffs,
	LoggedOutOdieChats,
	PersistedLoggedOutOdieChatState,
} from './types';

const isRecord = ( value: unknown ): value is Record< string, unknown > =>
	typeof value === 'object' && value !== null;

const isLoggedOutOdieChat = ( value: unknown ): value is LoggedOutOdieChat =>
	isRecord( value ) &&
	typeof value.odieId === 'number' &&
	typeof value.sessionId === 'string' &&
	typeof value.botSlug === 'string';

const getLoggedOutOdieChats = ( value: unknown ): LoggedOutOdieChats | undefined => {
	if ( ! isRecord( value ) || isLoggedOutOdieChat( value ) ) {
		return undefined;
	}

	const chats = Object.entries( value ).reduce< LoggedOutOdieChats >(
		( result, [ botSlug, session ] ) => {
			if ( isLoggedOutOdieChat( session ) && session.botSlug === botSlug ) {
				result[ botSlug ] = session;
			}
			return result;
		},
		{}
	);

	return Object.keys( chats ).length ? chats : undefined;
};

const getLoggedOutOdieChatHandoffs = ( value: unknown ): LoggedOutOdieChatHandoffs | undefined => {
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	const handoffs = Object.entries( value ).reduce< LoggedOutOdieChatHandoffs >(
		( result, [ botSlug, shouldHandOff ] ) => {
			if ( shouldHandOff === true ) {
				result[ botSlug ] = true;
			}
			return result;
		},
		{}
	);

	return Object.keys( handoffs ).length ? handoffs : undefined;
};

export const getPersistedLoggedOutOdieChatState = (): PersistedLoggedOutOdieChatState => {
	const value = oneWeekPersistenceStorage.getItem( ONE_WEEK_PERSISTENCE_STORAGE_KEY );

	if ( ! value ) {
		return {};
	}

	try {
		const persistedState: unknown = JSON.parse( value );
		if ( ! isRecord( persistedState ) ) {
			return {};
		}

		const helpCenterState = persistedState[ STORE_KEY ];
		if ( ! isRecord( helpCenterState ) ) {
			return {};
		}

		const singularChat = isLoggedOutOdieChat( helpCenterState.loggedOutOdieChat )
			? helpCenterState.loggedOutOdieChat
			: undefined;
		const legacyChats = getLoggedOutOdieChats( helpCenterState.loggedOutOdieChat );
		const chats = {
			...legacyChats,
			...getLoggedOutOdieChats( helpCenterState.loggedOutOdieChats ),
		};

		return {
			loggedOutOdieChat: singularChat,
			loggedOutOdieChats: Object.keys( chats ).length ? chats : undefined,
			loggedOutOdieChatHandoffs: getLoggedOutOdieChatHandoffs(
				helpCenterState.loggedOutOdieChatHandoffs
			),
		};
	} catch {
		return {};
	}
};
