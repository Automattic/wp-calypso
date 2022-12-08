import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';

type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
	isLoading: boolean;
	eligible: boolean;
	proxied?: boolean;
};

export function useShouldRenderChatOption(): Result {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const { data: chatAvailability, isLoading } = useHappychatAvailable(
		Boolean( chatStatus?.is_user_eligible )
	);

	if ( ! chatStatus?.is_user_eligible ) {
		return {
			render: false,
			isLoading,
			state: chatStatus?.is_chat_closed ? 'CLOSED' : 'UNAVAILABLE',
			eligible: false,
			proxied: chatAvailability?.proxied,
		};
	} else if ( chatStatus?.is_chat_closed ) {
		return {
			render: true,
			state: 'CLOSED',
			isLoading,
			eligible: true,
			proxied: chatAvailability?.proxied,
		};
	} else if ( chatAvailability?.available ) {
		return {
			render: true,
			state: 'AVAILABLE',
			isLoading,
			eligible: true,
			proxied: chatAvailability?.proxied,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		isLoading,
		eligible: true,
		proxied: chatAvailability?.proxied,
	};
}
