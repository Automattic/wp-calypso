type AgentsManagerActionsGlobal = {
	isReady?: boolean;
};

export function getIsAgentsManagerAvailable(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return (
		( window as Window & { __agentsManagerActions?: AgentsManagerActionsGlobal } )
			.__agentsManagerActions?.isReady === true
	);
}
