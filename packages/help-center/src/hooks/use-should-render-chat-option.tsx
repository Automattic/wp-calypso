import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';

type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
	isLoading: boolean;
	eligible: boolean;
};

export function useShouldRenderChatOption(): Result {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	// when the user is looking at the help page, we want to be extra sure they don't start a chat without available operators
	// so in this case, let's make stale time 1 minute.
	const { data, isLoading } = useHappychatAvailable(
		Boolean( chatStatus?.is_user_eligible ),
		60 * 1000
	);

	if ( ! chatStatus?.is_user_eligible ) {
		return {
			render: false,
			isLoading,
			state: chatStatus?.is_chat_closed ? 'CLOSED' : 'UNAVAILABLE',
			eligible: false,
		};
	} else if ( chatStatus?.is_chat_closed ) {
		return {
			render: true,
			state: 'CLOSED',
			isLoading,
			eligible: true,
		};
	} else if ( data?.available ) {
		return {
			render: true,
			state: 'AVAILABLE',
			isLoading,
			eligible: true,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		isLoading,
		eligible: true,
	};
}
