import type { LoggedOutOdieChat } from './types';

// Backward compatibility for sessions persisted before logged-out chats were keyed by bot slug.
export const isLegacyLoggedOutOdieChat = ( value: unknown ): value is LoggedOutOdieChat =>
	typeof value === 'object' &&
	value !== null &&
	'botSlug' in value &&
	typeof value.botSlug === 'string';
