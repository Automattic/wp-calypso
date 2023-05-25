import useChat from '../hooks/use-chat';

type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
	isLoading: boolean;
	eligible: boolean;
	hasActiveChats: boolean;
};

export function useShouldRenderChatOption(): Result {
	const { hasActiveChats, isChatAvailable, isChatClosed, isEligibleForChat, isLoading } = useChat();

	if ( ! isEligibleForChat ) {
		return {
			render: false,
			isLoading,
			state: isChatClosed ? 'CLOSED' : 'UNAVAILABLE',
			eligible: false,
			hasActiveChats,
		};
	} else if ( isChatClosed ) {
		return {
			render: true,
			state: 'CLOSED',
			isLoading,
			eligible: true,
			hasActiveChats,
		};
	} else if ( isChatAvailable || hasActiveChats ) {
		return {
			render: true,
			state: 'AVAILABLE',
			isLoading,
			eligible: true,
			hasActiveChats,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		isLoading,
		eligible: true,
		hasActiveChats,
	};
}
