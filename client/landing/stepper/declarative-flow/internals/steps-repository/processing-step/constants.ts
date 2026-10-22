export enum ProcessingResult {
	NO_ACTION = 'no-action',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

type ProcessingSuccessReason =
	'processing_missing_site' | 'processing_no_redirect' | 'site_not_created';

/**
 * The error-step reason for a processing result that sends the customer to the error step.
 * NO_ACTION means the pending action was gone, as after a reload. SUCCESS means the result
 * lacks what the flow needs next. Any other value is a failure, so every flow puts an
 * unexpected result in the same bucket.
 */
export const getProcessingErrorReason = (
	result: ProcessingResult | undefined,
	successReason: ProcessingSuccessReason = 'processing_missing_site'
): 'processing_no_action' | 'processing_failed' | ProcessingSuccessReason => {
	switch ( result ) {
		case ProcessingResult.NO_ACTION:
			return 'processing_no_action';
		case ProcessingResult.SUCCESS:
			return successReason;
		default:
			return 'processing_failed';
	}
};
