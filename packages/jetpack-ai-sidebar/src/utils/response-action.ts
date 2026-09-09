export interface ResponseAction {
	action: 'accept' | 'bulk_accept' | 'dismiss' | 'undo';
	target: ResponseActionTarget;
	outcome: ResponseActionOutcome;
	itemCount?: number;
}

export type ResponseActionOutcome = 'success' | 'failed' | 'partial_failed';

export type ResponseActionTarget =
	| 'conflict'
	| 'edit'
	| 'guideline_violation'
	| 'image'
	| 'mixed'
	| 'option';

export type OnResponseAction = ( action: ResponseAction ) => void;

/** Maps all-success, all-failed, and mixed bulk results to one outcome. */
export function getBulkResponseActionOutcome(
	successCount: number,
	failureCount: number
): ResponseActionOutcome {
	if ( failureCount === 0 ) {
		return 'success';
	}
	return successCount === 0 ? 'failed' : 'partial_failed';
}
