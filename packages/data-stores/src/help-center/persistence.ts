import { getLoggedOutOdieChatHandoff } from '../plugins/one-week-persistence-config';
import { STORE_KEY } from './constants';
import type { LoggedOutOdieChat, LoggedOutOdieChats } from './types';

const isLoggedOutOdieChat = ( value: unknown ): value is LoggedOutOdieChat =>
	typeof value === 'object' &&
	value !== null &&
	'odieId' in value &&
	typeof value.odieId === 'number' &&
	'sessionId' in value &&
	typeof value.sessionId === 'string' &&
	'botSlug' in value &&
	typeof value.botSlug === 'string';

export const getLoggedOutOdieChatHandoffSessions = (): LoggedOutOdieChat[] => {
	const value = getLoggedOutOdieChatHandoff();

	if ( ! value ) {
		return [];
	}

	try {
		const persistedState: unknown = JSON.parse( value );
		if ( typeof persistedState !== 'object' || persistedState === null ) {
			return [];
		}

		const helpCenterState = ( persistedState as Record< string, unknown > )[ STORE_KEY ];
		if ( typeof helpCenterState !== 'object' || helpCenterState === null ) {
			return [];
		}

		const { loggedOutOdieChat, loggedOutOdieChats, loggedOutOdieChatHandoffs } =
			helpCenterState as {
				loggedOutOdieChat?: LoggedOutOdieChat | LoggedOutOdieChats;
				loggedOutOdieChats?: LoggedOutOdieChats;
				loggedOutOdieChatHandoffs?: Record< string, true >;
			};

		return Object.keys( loggedOutOdieChatHandoffs ?? {} ).flatMap( ( botSlug ) => {
			const session = loggedOutOdieChats?.[ botSlug ];
			if ( isLoggedOutOdieChat( session ) ) {
				return [ session ];
			}

			// Read the singular and temporary keyed shapes for backwards compatibility.
			if ( isLoggedOutOdieChat( loggedOutOdieChat ) ) {
				return loggedOutOdieChat.botSlug === botSlug ? [ loggedOutOdieChat ] : [];
			}

			const legacySession = loggedOutOdieChat?.[ botSlug ];
			return isLoggedOutOdieChat( legacySession ) ? [ legacySession ] : [];
		} );
	} catch {
		return [];
	}
};
