/**
 * External Dependencies
 */
import { useZendeskMessaging } from '@automattic/help-center/src/hooks';
import { useDispatch } from '@wordpress/data';
import { useSelector } from 'react-redux';
/**
 * External Dependencies
 */
import { getSectionName } from 'calypso/state/ui/selectors'; /* eslint-disable-line no-restricted-imports */
import { useUpdateZendeskUserFieldsMutation } from '../data/use-update-zendesk-user-fields';
import { HELP_CENTER_STORE } from '../stores';
import type { ZendeskConfigName } from '@automattic/help-center/src/hooks/use-zendesk-messaging';

export default function useChatWidget(
	configName: ZendeskConfigName = 'zendesk_support_chat_key',
	enabled = true
) {
	const sectionName = useSelector( getSectionName );
	const { isLoading: isSubmittingZendeskUserFields, mutateAsync: submitZendeskUserFields } =
		useUpdateZendeskUserFieldsMutation();
	const { setShowHelpCenter, resetStore } = useDispatch( HELP_CENTER_STORE );

	const { isMessagingScriptLoaded } = useZendeskMessaging( configName, enabled, enabled );

	const openChatWidget = (
		message: string | undefined,
		siteUrl = 'No site selected',
		onError?: () => void,
		onSuccess?: () => void
	) => {
		submitZendeskUserFields( {
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
				}
			} )
			.catch( () => {
				onError?.();
			} );
	};

	return {
		isOpeningChatWidget: isSubmittingZendeskUserFields || ! isMessagingScriptLoaded,
		openChatWidget,
	};
}
