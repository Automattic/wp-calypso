import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { HumanSupportRequest } from '../types';

/**
 * Asks for a human. Without a routing step this starts a Zendesk chat, as before. With one, the
 * request waits in the chat until the step decides where it goes.
 */
export const useRequestHumanSupport = () => {
	const { humanSupportRouting, setPendingHumanSupportRequest, trackEvent } =
		useOdieAssistantContext();
	const createZendeskConversation = useCreateZendeskConversation();

	return ( request: HumanSupportRequest ) => {
		if ( humanSupportRouting ) {
			trackEvent( 'human_support_routing_started', {
				created_from: request.createdFrom,
				is_emergency: request.flags.isEmergency,
				route_to_email: request.flags.routeToEmail,
			} );
			setPendingHumanSupportRequest( request );
			return;
		}

		return createZendeskConversation( {
			createdFrom: request.createdFrom,
			isFromError: request.isFromError,
			errorReason: request.errorReason,
			escalationOnSecondAttempt: request.escalationOnSecondAttempt,
		} );
	};
};
