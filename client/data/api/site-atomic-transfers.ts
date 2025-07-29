import wpcom from 'calypso/lib/wp';

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
}

export async function fetchLatestAtomicTransfer( siteId: number ): Promise< AtomicTransfer > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/atomic/transfers/latest`,
		apiNamespace: 'wpcom/v2',
	} );
}
