import { getOdieInitialMessageConstant } from '../constants';
import type { Context, Message, OdieAllowedBots } from '../types/index';

const getOdieInitialPrompt = (
	botNameSlug: OdieAllowedBots,
	shouldUseHelpCenterExperience: boolean | undefined
): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
		case 'wpcom-plan-support':
			return getOdieInitialMessageConstant( shouldUseHelpCenterExperience );
	}
};

const getOdieInitialPromptContext = ( botNameSlug: OdieAllowedBots ): Context | undefined => {
	switch ( botNameSlug ) {
		case 'wpcom-plan-support':
			return {
				flags: {
					forward_to_human_support: true,
				},
				site_id: null,
			};
		default:
			return undefined;
	}
};

export const getOdieInitialMessage = (
	botNameSlug: OdieAllowedBots,
	odieInitialPromptText?: string,
	shouldUseHelpCenterExperience?: boolean
): Message => {
	return {
		content:
			odieInitialPromptText || getOdieInitialPrompt( botNameSlug, shouldUseHelpCenterExperience ),
		role: 'bot',
		type: 'introduction',
		context: getOdieInitialPromptContext( botNameSlug ),
	};
};
