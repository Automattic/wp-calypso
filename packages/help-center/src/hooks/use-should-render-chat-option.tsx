import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';

type Result = {
	render: boolean;
	state?: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
	isLoading: boolean;
};

export function useShouldRenderChatOption(): Result {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const { available, isLoading } = useHappychatAvailable();

	if ( ! chatStatus?.is_user_eligible ) {
		return {
			render: false,
			isLoading,
		};
	} else if ( chatStatus?.is_chat_closed ) {
		return {
			render: true,
			state: 'CLOSED',
			isLoading,
		};
	} else if ( available ) {
		return {
			render: true,
			state: 'AVAILABLE',
			isLoading,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		isLoading,
	};
}
