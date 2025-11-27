import { getTimestamp } from './get-timestamp';
import type { Chat } from '../types';

const MAX_ESCALATION_ATTEMPT_TIME = 3 * 24 * 60 * 60 * 1000; // three days

export const hasRecentEscalationAttempt = ( chat: Chat ) => {
	return (
		chat?.messages?.some( ( message ) => {
			if ( ! message.context?.flags?.forward_to_human_support || ! message.created_at ) {
				return false;
			}

			const messageTimestamp = getTimestamp( message.created_at ) * 1000;
			const threeDaysAgo = Date.now() - MAX_ESCALATION_ATTEMPT_TIME;

			return messageTimestamp >= threeDaysAgo;
		} ) ?? false
	);
};
