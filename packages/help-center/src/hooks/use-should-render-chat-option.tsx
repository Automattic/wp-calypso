import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';

type Result = {
	render: boolean;
	state?: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
};

export function useShouldRenderChatOption(): Result {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const chatAvailable = useHappychatAvailable();

	if ( ! chatStatus?.isUserEligible ) {
		return {
			render: false,
		};
	} else if ( chatStatus?.isClosed ) {
		return {
			render: true,
			state: 'CLOSED',
		};
	} else if ( chatAvailable.available ) {
		return {
			render: true,
			state: 'AVAILABLE',
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
	};
}
