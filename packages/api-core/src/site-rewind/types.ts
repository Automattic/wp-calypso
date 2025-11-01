import type { RestoreStatus } from '../site-backup-restore/types';

export type RewindStateType =
	| 'active'
	| 'inactive'
	| 'unavailable'
	| 'awaiting_credentials'
	| 'provisioning';

export interface RestoreInfo {
	restore_id: number;
	rewind_id: string;
	status: RestoreStatus;
	started_at: string;
	site_id: number;
	progress?: number; // Only present when status is 'running'
	message?: string; // Only present when status is 'running'
	current_entry?: string | null; // Only present when status is 'running'
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
