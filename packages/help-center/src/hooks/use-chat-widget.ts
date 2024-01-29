/**
 * External Dependencies
 */
import { useZendeskMessaging } from '@automattic/help-center/src/hooks';
import { useDispatch } from '@wordpress/data';
import { useSelector } from 'react-redux';
/**
 * External Dependencies
 */
import getUserSetting from 'calypso/state/selectors/get-user-setting'; /* eslint-disable-line no-restricted-imports */
import { getSectionName } from 'calypso/state/ui/selectors'; /* eslint-disable-line no-restricted-imports */
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

export default function useChatWidget(
	configName: ZendeskConfigName = 'zendesk_support_chat_key',
	enabled = true
) {
	const sectionName = useSelector( getSectionName );
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitZendeskUserFields } =
		useUpdateZendeskUserFieldsMutation();
	const { setShowHelpCenter, resetStore } = useDispatch( HELP_CENTER_STORE );

	const { isMessagingScriptLoaded } = useZendeskMessaging( configName, enabled, enabled );

	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const openChatWidget = ( {
		aiChatId,
		message = 'No message from user',
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

					if ( isDevAccount ) {
						window.zE( 'messenger:set', 'conversationTags', [ 'wpcom_dev_account' ] );
					}
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
