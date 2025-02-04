import { ODIE_ALLOWED_BOTS } from '../constants';
import type { OdieAllowedBots } from '../types';

export function isOdieAllowedBot(
	botNameSlug: string | undefined
): botNameSlug is OdieAllowedBots {
	return !! ( botNameSlug && ODIE_ALLOWED_BOTS.includes( botNameSlug as OdieAllowedBots ) );
}
