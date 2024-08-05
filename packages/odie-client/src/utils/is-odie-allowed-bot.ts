import { OdieAllowedBots, odieAllowedBots } from '../types/';

function isOdieAllowedBot( botNameSlug: string | undefined ): botNameSlug is OdieAllowedBots {
	return !! ( botNameSlug && odieAllowedBots.includes( botNameSlug as OdieAllowedBots ) );
}

export { isOdieAllowedBot };
