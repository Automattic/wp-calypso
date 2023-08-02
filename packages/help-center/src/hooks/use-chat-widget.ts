/**
 * External Dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useSelector } from 'react-redux';
/**
 * External Dependencies
 */
import { getSectionName } from 'calypso/state/ui/selectors'; /* eslint-disable-line no-restricted-imports */
import { useUpdateZendeskUserFieldsMutation } from '../data/use-update-zendesk-user-fields';
import { HELP_CENTER_STORE } from '../stores';

export default function useChatWidget() {
	const sectionName = useSelector( getSectionName );
	const { isLoading: isSubmittingZendeskUserFields, mutateAsync: submitZendeskUserFields } =
		useUpdateZendeskUserFieldsMutation();
	const { setShowMessagingChat } = useDispatch( HELP_CENTER_STORE );

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
				setShowMessagingChat();
			} )
			.catch( () => {
				onError?.();
			} );
	};

	return {
		isOpeningChatWidget: isSubmittingZendeskUserFields,
		openChatWidget,
	};
}
