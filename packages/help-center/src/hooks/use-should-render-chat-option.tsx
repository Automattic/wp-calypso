type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE';
	eligible: boolean;
};

export function useShouldRenderChatOption(
	isChatAvailable: boolean,
	isEligibleForChat: boolean
): Result {
	if ( ! isEligibleForChat ) {
		return {
			render: false,
			state: 'UNAVAILABLE',
			eligible: false,
		};
	} else if ( isChatAvailable ) {
		return {
			render: true,
			state: 'AVAILABLE',
			eligible: true,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		eligible: true,
	};
}
