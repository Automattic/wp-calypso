import { transferStates } from 'calypso/state/automated-transfer/constants';

/*
 * This object acts as a mapping between the transferStates object.
 * We actually limit the transferStates object to only the states we care about,
 * keeping only a start - middle - end state.
 * The object mapping is happening inside staging-site-card/index.js component.
 */
export const StagingSiteStatus = {
	UNSET: '',
	NONE: transferStates.NONE,
	REVERTING: 'reverting',
	INITIATE_TRANSFERRING: 'initiate transferring',
	INITIATE_REVERTING: 'initiate reverting',
	TRANSFERRING: 'transferring',
	COMPLETE: transferStates.COMPLETE,
	REVERTED: transferStates.REVERTED,
};
