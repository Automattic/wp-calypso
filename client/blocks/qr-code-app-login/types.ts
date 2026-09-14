export interface Token {
	token: string;
	encrypted: string;
	/** Token expiry as a Unix timestamp in seconds. */
	expires: number;
}

export interface StatusPending {
	status: 'pending';
}

export interface StatusScanned {
	status: 'scanned';
	numbers: readonly [ number, number, number ];
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

export const KNOWN_STATUSES: ReadonlyArray< Status[ 'status' ] > = [
	'pending',
	'scanned',
	'approved',
	'consumed',
	'expired',
	'rejected',
];

export const TERMINAL_STATUSES: ReadonlyArray< Status[ 'status' ] > = [
	'consumed',
	'expired',
	'rejected',
];

export interface ApiError extends Error {
	code?: string;
}
