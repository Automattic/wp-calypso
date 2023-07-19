import { OdieAllowedSectionNames, OdieAllowedBots } from '../types';

// This is a temporal solution, we might need to move this to the backend.
const getWapuuInitialPrompts = ( sectionName: OdieAllowedSectionNames ): string => {
	switch ( sectionName ) {
		case 'plans':
			return 'Hello, I am Wapuu! I am here to help you choose the best plan for your site. You can ask me about our plans and their features.';
		default:
			return 'Hello, I am Wapuu! Your personal assistant.';
	}
};

export const getOdieInitialPrompt = (
	sectionName: OdieAllowedSectionNames,
	botNameSlug: OdieAllowedBots = 'wapuu'
): string => {
	switch ( botNameSlug ) {
		case 'wapuu':
			return getWapuuInitialPrompts( sectionName );
		default:
			return 'Hello, I am your personal assistant.';
	}
};
