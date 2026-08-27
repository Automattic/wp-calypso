/**
 * Shared sequential bulk-apply runner for review components. Owns the running
 * flag, the stale-context aborts, the success/failure counts, and the single
 * aggregate `bulk_accept` report.
 */

import { useCallback, useState } from '@wordpress/element';
import {
	getBulkResponseActionOutcome,
	type OnResponseAction,
	type ResponseActionTarget,
} from './response-action';

/**
 * Applies one bulk target and reports whether it succeeded. `undefined` marks
 * a stale abort the step handled itself (item state restored, result not
 * counted); the runner's own post-step stale re-check is the backstop.
 */
export type BulkApplyStep = () => Promise< boolean | undefined >;

/**
 * Runs bulk-apply steps sequentially so each edit validates against the live
 * block, then fires one aggregate action. A stale post context aborts the run
 * without reporting.
 */
export default function useBulkApply(
	fireResponseAction: OnResponseAction,
	isLatestPostContextStale: () => boolean
): {
	bulkRunning: boolean;
	runBulkApply: ( target: ResponseActionTarget, steps: BulkApplyStep[] ) => Promise< void >;
} {
	const [ bulkRunning, setBulkRunning ] = useState( false );

	const runBulkApply = useCallback(
		async ( target: ResponseActionTarget, steps: BulkApplyStep[] ) => {
			if ( bulkRunning || isLatestPostContextStale() ) {
				return;
			}
			setBulkRunning( true );
			try {
				let successCount = 0;
				let failureCount = 0;
				for ( const step of steps ) {
					if ( isLatestPostContextStale() ) {
						return;
					}
					// eslint-disable-next-line no-await-in-loop
					const succeeded = await step();
					if ( succeeded === undefined || isLatestPostContextStale() ) {
						return;
					}
					if ( succeeded ) {
						successCount++;
					} else {
						failureCount++;
					}
				}
				fireResponseAction( {
					action: 'bulk_accept',
					target,
					outcome: getBulkResponseActionOutcome( successCount, failureCount ),
					itemCount: successCount + failureCount,
				} );
			} finally {
				setBulkRunning( false );
			}
		},
		[ bulkRunning, fireResponseAction, isLatestPostContextStale ]
	);

	return { bulkRunning, runBulkApply };
}
