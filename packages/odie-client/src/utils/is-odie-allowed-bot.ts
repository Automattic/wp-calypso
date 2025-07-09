import { ODIE_ALLOWED_BOTS } from '../constants';
import type { OdieAllowedBots } from '../types';

/**
 * Checks if a bot is allowed based on its name slug.
 * @param {string | undefined} botNameSlug - The slug of the bot to check.
 * @returns {boolean} - True if the bot is allowed, false otherwise.
 */
export const isOdieAllowedBot = ( botNameSlug: string | undefined ): boolean => {
	return !! ( botNameSlug && ODIE_ALLOWED_BOTS.includes( botNameSlug as OdieAllowedBots ) );
};
