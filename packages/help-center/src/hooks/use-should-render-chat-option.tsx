import { useSupportAvailability, useSupportActivity } from '@automattic/data-stores';
import useMessagingAvailability from './use-messaging-availability';

type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
	isLoading: boolean;
	eligible: boolean;
	to: string;
};

export function useShouldRenderChatOption(): Result {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const { data, isInitialLoading: isLoadingAvailability } = useMessagingAvailability(
		Boolean( chatStatus?.is_user_eligible )
	);
	const { data: supportActivity, isInitialLoading: isLoadingSupportActivity } = useSupportActivity(
		Boolean( chatStatus?.is_user_eligible )
	);

	const isLoading = isLoadingAvailability || isLoadingSupportActivity;

	if ( ! chatStatus?.is_user_eligible ) {
		return {
			render: false,
			isLoading,
			state: chatStatus?.is_chat_closed ? 'CLOSED' : 'UNAVAILABLE',
			eligible: false,
			to: '',
		};
	} else if ( chatStatus?.is_chat_closed ) {
		return {
			render: true,
			state: 'CLOSED',
			isLoading,
			eligible: true,
			to: '',
		};
	} else if ( data?.is_available ) {
		const hasActiveChats = supportActivity?.some( ( ticket ) => ticket.channel === 'Messaging' );
		const to = hasActiveChats ? '/inline-chat' : '/contact-form?mode=CHAT';
		return {
			render: true,
			state: 'AVAILABLE',
			isLoading,
			eligible: true,
			to,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		isLoading,
		eligible: true,
		to: '',
	};
}
