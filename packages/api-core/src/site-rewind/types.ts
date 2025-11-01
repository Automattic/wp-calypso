import type { RestoreStatus } from '../site-backup-restore/types';

export type RewindStateType =
	| 'active'
	| 'inactive'
	| 'unavailable'
	| 'awaiting_credentials'
	| 'provisioning';

export interface RestoreInfo {
	restoreId: number;
	rewindId: string;
	status: RestoreStatus;
	startedAt: string;
	siteId: number;
	progress?: number; // Only present when status is 'running'
	message?: string; // Only present when status is 'running'
	currentEntry?: string; // Only present when status is 'running'
	reason?: string; // Only present when status is 'failed'
	links?: {
		dismiss?: {
			apiVersion: string;
			method: string;
			path: string;
		};
	};
}

export interface RewindState {
	state: RewindStateType;
	rewind?: RestoreInfo;
}
