import type { LoggedOutOdieChat } from './types';

export const isLoggedOutOdieChat = ( value: unknown ): value is LoggedOutOdieChat =>
	typeof value === 'object' &&
	value !== null &&
	'botSlug' in value &&
	typeof value.botSlug === 'string';
