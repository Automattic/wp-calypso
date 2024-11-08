import { OdieAllowedBots, odieAllowedBots } from '../types/';

export function isOdieAllowedBot(
	botNameSlug: string | undefined
): botNameSlug is OdieAllowedBots {
	return !! ( botNameSlug && odieAllowedBots.includes( botNameSlug as OdieAllowedBots ) );
}
