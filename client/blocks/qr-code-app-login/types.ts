export interface Token {
	token: string;
	encrypted: string;
	expires: number;
}

export interface StatusPending {
	status: 'pending';
}

export interface StatusScanned {
	status: 'scanned';
	numbers: number[];
	device: string;
}

export interface StatusApproved {
	status: 'approved';
}

export interface StatusConsumed {
	status: 'consumed';
}

export interface StatusExpired {
	status: 'expired';
}

export interface StatusRejected {
	status: 'rejected';
}

export type Status =
	| StatusPending
	| StatusScanned
	| StatusApproved
	| StatusConsumed
	| StatusExpired
	| StatusRejected;
