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
	/**
	 * When the site was reverted to Simple (`Y-m-d H:i:s`, UTC), or null while
	 * it has not been. Optional until the wpcom branch `add/atomic-transfer-revert-fields`
	 * ships; the fixture keeps setting it.
	 */
	reverted_at?: string | null;
	/**
	 * Whether the revert was the automatic one that follows an expired plan.
	 * Optional until the wpcom branch `add/atomic-transfer-revert-fields`
	 * ships; the fixture keeps setting it.
	 */
	reverted_for_expired_plan?: boolean;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
}
