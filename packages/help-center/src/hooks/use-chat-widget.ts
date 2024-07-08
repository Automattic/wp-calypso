/**
 * External Dependencies
 */
import { useZendeskMessaging } from '@automattic/help-center/src/hooks';
import { useDispatch } from '@wordpress/data';
/**
 * External Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useUpdateZendeskUserFieldsMutation } from '../data/use-update-zendesk-user-fields';
import { HELP_CENTER_STORE } from '../stores';
import type { ZendeskConfigName } from '@automattic/help-center/src/hooks/use-zendesk-messaging';

type ChatMetadata = {
	aiChatId?: string;
	message?: string;
	siteUrl?: string;
	onError?: () => void;
	onSuccess?: () => void;
};

export const ZENDESK_SOURCE_URL_TICKET_FIELD_ID = 23752099174548;

export default function useChatWidget(
	configName: ZendeskConfigName = 'zendesk_support_chat_key',
	enabled = true
) {
	const { sectionName } = useHelpCenterContext();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitZendeskUserFields } =
		useUpdateZendeskUserFieldsMutation();
	const { setShowHelpCenter, resetStore } = useDispatch( HELP_CENTER_STORE );

	const { isMessagingScriptLoaded } = useZendeskMessaging( configName, enabled, enabled );

	const openChatWidget = ( {
		aiChatId,
		message = '',
		siteUrl = 'No site selected',
		onError,
		onSuccess,
	}: ChatMetadata ) => {
		submitZendeskUserFields( {
			messaging_ai_chat_id: aiChatId,
			messaging_source: sectionName,
			messaging_initial_message: message,
			messaging_plan: '', // Will be filled out by backend
			messaging_url: siteUrl,
		} )
			.then( () => {
				onSuccess?.();
				setShowHelpCenter( false );
				resetStore();
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
		isOpeningChatWidget: enabled && ( isSubmittingZendeskUserFields || ! isMessagingScriptLoaded ),
		openChatWidget,
	};
}
