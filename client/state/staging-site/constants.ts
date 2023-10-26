export enum StagingSiteStatus {
	UNSET = '',
	NONE = 'none',
	REVERTING = 'reverting',
	INITIATE_TRANSFERRING = 'initiate transferring',
	INITIATE_REVERTING = 'initiate reverting',
	TRANSFERRING = 'transferring',
	COMPLETE = 'complete',
	REVERTED = 'reverted',
}
