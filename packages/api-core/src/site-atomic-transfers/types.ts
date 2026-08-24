export type AtomicTransferStatus =
	| 'pending'
	| 'active'
	| 'provisioned'
	| 'completed'
	| 'error'
	| 'reverted'
	| 'relocating_revert'
	| 'relocating_switcheroo'
	| 'reverting'
	| 'renaming'
	| 'exporting'
	| 'importing'
	| 'cleanup';

export interface AtomicTransfer {
	atomic_transfer_id: number;
	blog_id: number;
	status: AtomicTransferStatus;
	created_at: string;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
}
