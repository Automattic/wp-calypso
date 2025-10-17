export interface JetpackConnection {
	hasConnectedOwner: boolean;
	isActive: boolean;
	isPublic: boolean;
	isRegistered: boolean;
	isStaging: boolean;
	isUserConnected: boolean;
	offlineMode: {
		constant: boolean;
		filter: boolean;
		isActive: boolean;
		option: boolean;
		url: boolean;
		wpLocalConstant: boolean;
	};
}

export interface JetpackConnectionHealth {
	is_healthy: boolean;
	error?: string;
}
