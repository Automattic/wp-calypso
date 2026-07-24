export enum ProcessingResult {
	NO_ACTION = 'no-action',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

// Fallback rotation time (ms) for a flow-provided loading message that omits its own `duration`.
export const DEFAULT_LOADING_MESSAGE_DURATION = 5000;
