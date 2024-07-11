import { ZENDESK_SOURCE_URL_TICKET_FIELD_ID } from './constants';
import { useLoadZendeskMessaging } from './use-load-zendesk-messaging';
import { useUpdateZendeskUserFields } from './use-update-zendesk-user-fields';
import type { ZendeskConfigName, MessagingMetadata } from './types';

export function useOpenZendeskMessaging(
	sectionName: string,
	configName: ZendeskConfigName = 'zendesk_support_chat_key',
	enabled = true
) {
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();

	const { isMessagingScriptLoaded } = useLoadZendeskMessaging( configName, enabled, enabled );

	const openZendeskWidget = ( {
		aiChatId,
		message = '',
		siteUrl = 'No site selected',
		onError,
		onSuccess,
	}: MessagingMetadata ) => {
		submitUserFields( {
			messaging_ai_chat_id: aiChatId,
			messaging_source: sectionName,
			messaging_initial_message: message,
			messaging_plan: '', // Will be filled out by backend
			messaging_url: siteUrl,
		} )
			.then( () => {
				onSuccess?.();
				if ( typeof window.zE === 'function' ) {
					window.zE( 'messenger', 'open' );
					window.zE( 'messenger', 'show' );
					window.zE( 'messenger:set', 'conversationFields', [
						{ id: ZENDESK_SOURCE_URL_TICKET_FIELD_ID, value: window.location.href },
					] );
				} else {
					throw new Error( 'Zendesk chat widget not loaded' );
				}
			} )
			.catch( () => {
				onError?.();
			} );
	};

	return {
		isOpeningZendeskWidget:
			enabled && ( isSubmittingZendeskUserFields || ! isMessagingScriptLoaded ),
		openZendeskWidget,
	};
}
