type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE';
	eligible: boolean;
};

export function useShouldRenderChatOption( isChatAvailable: boolean ): Result {
	if ( isChatAvailable ) {
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
