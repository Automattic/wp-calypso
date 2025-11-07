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
	status: AtomicTransferStatus;
	created_at: string;
}
