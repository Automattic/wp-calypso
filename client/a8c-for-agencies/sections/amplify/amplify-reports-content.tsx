/**
 * AmplifyReportsContent
 *
 * Fetches the reports index from Cloudflare R2 and renders them in a DataViews
 * table. Also accepts `pendingJobs` from amplify-page.tsx — jobs that have been
 * submitted but not yet written to R2. These are merged at the top of the list
 * and shown with an "In progress" indicator instead of a download button.
 *
 * Data flow:
 *   R2 index (https://pub-*.r2.dev/reports/index.json)
 *     └── fetched on mount, refreshed only on page reload
 *   pendingJobs (in-memory, from amplify-page.tsx)
 *     └── added immediately when a job is submitted via the analysis modal
 *     └── displayed until the page is reloaded and R2 reflects the real status
 */

import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import AmplifySiteSelect from './amplify-site-select';
import AmplifyInfoPopover from './components/amplify-info-popover';
import useArchivedReports from './hooks/use-archived-reports';
import type { PendingJob } from './amplify-analysis-modal';
import type { Action, Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

type AnalysisMode = 'human' | 'ai' | 'fullanalysis';

type ReportStatus = 'active' | 'archived';

type Report = {
	id: string;
	agencyName: string;
	url: string;
	mode: AnalysisMode;
	timestamp: string;
	humanScore?: number;
	aiScore?: number;
	score?: number;
	pdfUrl?: string;
	reportUrl?: string;
	/** True for jobs submitted this session that haven't yet appeared in R2. */
	pending?: boolean;
	/**
	 * True for pending jobs whose startedAt is older than
	 * STALE_PENDING_THRESHOLD_MS — i.e. the Trigger.dev run almost certainly
	 * failed and we should surface that to the user. Derived per render so
	 * it flips as soon as the threshold is crossed (within a polling cycle).
	 */
	failed?: boolean;
	/**
	 * Derived per render from useArchivedReports() (localStorage-backed).
	 * Pending jobs are always 'active'. Once the wpcom endpoint replaces
	 * the R2 + localStorage split, this becomes a server-driven field on
	 * the report record itself — see hooks/use-archived-reports.ts.
	 */
	status: ReportStatus;
};

const INDEX_URL = 'https://pub-d85717c601eb44398d8336c65ac7cfbb.r2.dev/reports/index.json';

/**
 * A pending job that hasn't been resolved by an R2 entry within this many
 * milliseconds is treated as failed. The Trigger.dev task's maxDuration is
 * 20 minutes; the fail-loud guard there turns silent worker failures into
 * visible task failures, but Calypso has no direct signal of those failures
 * today — so we use a client-side timeout to convert the never-resolving
 * pending row into a user-facing error state. 30 minutes gives us a 10-min
 * cushion above maxDuration so a slow-but-legitimate run isn't prematurely
 * marked as failed.
 */
const STALE_PENDING_THRESHOLD_MS = 30 * 60 * 1000;

const MODE_LABELS: Record< AnalysisMode, string > = {
	human: 'Human',
	ai: 'AI',
	fullanalysis: 'Full',
};

/**
 * Determines whether a pending Trigger.dev job has a matching completed report
 * in the R2 index. See the comment on the merge useMemo below for the full
 * rationale on why we match by url + normalized mode + timestamp window rather
 * than by ID.
 */
function isPendingJobResolved( job: PendingJob, fetchedReports: Report[] ): boolean {
	const normalizedMode: AnalysisMode =
		job.type === 'full' ? 'fullanalysis' : ( job.type as AnalysisMode );
	return fetchedReports.some(
		( r ) =>
			r.url === job.site &&
			r.mode === normalizedMode &&
			// Lexicographic compare of ISO 8601 strings is correct here only
			// because both timestamps come from Date.prototype.toISOString(),
			// which always produces the canonical 'YYYY-MM-DDTHH:mm:ss.sssZ'
			// form. If a future caller passes a timestamp in any other format
			// (locale string, offset other than Z, missing milliseconds), switch
			// this to Date.parse(...) comparisons.
			r.timestamp >= job.startedAt
	);
}

/**
 * Fetches the R2 reports index on mount, and (when `shouldPoll` is true)
 * re-fetches every POLL_INTERVAL_MS so an in-progress job can flip to a
 * downloadable row without the user reloading the page.
 *
 * Callers pass `shouldPoll = pendingJobs.length > 0` so we only poll while a
 * job is actually outstanding. When the last pending job resolves and the
 * caller stops passing `true`, this effect tears down the interval and we
 * go back to the cheap on-mount-only mode.
 */
function useAmplifyReports( shouldPoll: boolean ): {
	reports: Report[];
	isLoading: boolean;
	error: string | null;
} {
	const [ reports, setReports ] = useState< Report[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		let cancelled = false;

		const fetchReports = () => {
			window
				.fetch( `${ INDEX_URL }?_=${ Date.now() }` )
				.then( ( res ) => {
					// 404 means no analyses have been run yet — treat as empty, not error.
					if ( res.status === 404 ) {
						return { reports: [] };
					}
					if ( ! res.ok ) {
						throw new Error( `Failed to load reports: ${ res.status }` );
					}
					return res.json();
				} )
				.then( ( data ) => {
					if ( cancelled ) {
						return;
					}
					setReports( Array.isArray( data.reports ) ? data.reports : [] );
					// Clear any previous error once a poll succeeds, so an intermittent
					// R2 hiccup doesn't pin the table in an error state forever.
					setError( null );
				} )
				.catch( ( err ) => {
					if ( ! cancelled ) {
						setError( err.message );
					}
				} )
				.finally( () => {
					if ( ! cancelled ) {
						setIsLoading( false );
					}
				} );
		};

		fetchReports();

		// 20s is responsive enough that a finished report flips within ~half a
		// minute, while keeping the fetch volume tiny — the index payload is
		// small JSON and Trigger runs take 5–15 minutes, so this is well under
		// any meaningful R2 traffic threshold.
		const POLL_INTERVAL_MS = 20_000;
		const intervalId = shouldPoll ? setInterval( fetchReports, POLL_INTERVAL_MS ) : null;

		return () => {
			cancelled = true;
			if ( intervalId !== null ) {
				clearInterval( intervalId );
			}
		};
	}, [ shouldPoll ] );

	return { reports, isLoading, error };
}

function formatTimestamp( iso: string ): string {
	return new Date( iso ).toLocaleString( undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	} );
}

function ScoreBadge( { score, label }: { score?: number; label: string } ) {
	if ( score === undefined ) {
		return null;
	}
	let threshold: string;
	if ( score >= 80 ) {
		threshold = 'strong';
	} else if ( score >= 50 ) {
		threshold = 'needs-work';
	} else {
		threshold = 'at-risk';
	}
	return (
		<span className={ clsx( 'amplify-reports-score', `is-${ threshold }` ) }>
			{ sprintf(
				/* translators: %1$s is the score label (e.g. Human), %2$d is the numeric score */
				__( '%1$s %2$d' ),
				label,
				score
			) }
		</span>
	);
}

export default function AmplifyReportsContent( {
	pendingJobs = [],
	onSiteSelected,
	onPendingJobsResolved,
}: {
	pendingJobs?: PendingJob[];
	onSiteSelected: ( url: string ) => void;
	/**
	 * Called with the jobIds of any pending jobs that now have a matching
	 * completed report in the R2 index. Used by the parent to prune resolved
	 * entries out of sessionStorage so the pending list doesn't accumulate.
	 *
	 * **Must be referentially stable across renders** (wrap in `useCallback`
	 * with stable deps in the parent). The effect below lists this prop as a
	 * dependency, so an unstable reference will fire the effect on every
	 * render and risk a re-render loop.
	 */
	onPendingJobsResolved?: ( jobIds: string[] ) => void;
} ) {
	const dispatch = useDispatch();
	// Poll the R2 index while at least one *non-stale* pending job is in
	// flight so the table can flip the row to "Download PDF" without a
	// manual page refresh. Stale pendings (past STALE_PENDING_THRESHOLD_MS)
	// are effectively failed — polling for them is wasted traffic since the
	// Trigger.dev run is either already errored out or way past its max
	// duration. The boolean is recomputed on every render rather than
	// memoized so the staleness check stays correct as the wall clock
	// advances even when `pendingJobs` itself doesn't change.
	const cutoff = Date.now() - STALE_PENDING_THRESHOLD_MS;
	const hasNonStalePending = pendingJobs.some(
		( job ) => new Date( job.startedAt ).getTime() >= cutoff
	);
	const { reports: fetchedReports, isLoading, error } = useAmplifyReports( hasNonStalePending );

	// Archive state is held client-side (localStorage). See the header of
	// hooks/use-archived-reports.ts for the migration plan to a wpcom endpoint.
	const { isArchived, archive, unarchive } = useArchivedReports();

	// Merge pending jobs into the reports list. A pending job is shown at the
	// top with the `pending` flag set. Once the R2 index updates and a real
	// report appears for the same site + mode, the pending row is dropped on the
	// next render so the table flips from "Report in progress" to the real row.
	//
	// We can't match on ID because the Trigger.dev jobId (held by the pending
	// entry) and the R2 report id (the report filename basename) are different
	// strings and there's no link between them in the index. Instead we match by
	// url + normalized mode + a timestamp window: a completed report counts as
	// the resolution of a pending job if its timestamp is at or after the job's
	// startedAt. That keeps stale prior runs for the same URL from prematurely
	// dropping a fresh pending row.
	//
	// Memoized so that table interactions (sort/filter/paginate) that trigger a
	// re-render don't rebuild the match index and re-map the arrays unnecessarily.
	// Pending jobs are always `status: 'active'` — you can't archive a job that
	// hasn't finished. Completed reports take their status from useArchivedReports.
	const reports = useMemo< Report[] >( () => {
		const pendingReports: Report[] = pendingJobs
			.filter( ( job ) => ! isPendingJobResolved( job, fetchedReports ) )
			.map( ( job ) => {
				// A pending job whose startedAt is older than the stale
				// threshold is treated as failed (see STALE_PENDING_THRESHOLD_MS).
				// `failed` rides alongside `pending` rather than replacing it
				// because the row is still in sessionStorage and still
				// pending-by-state — it just won't resolve.
				const startedAtMs = new Date( job.startedAt ).getTime();
				const failed = Date.now() - startedAtMs > STALE_PENDING_THRESHOLD_MS;
				return {
					id: job.jobId,
					agencyName: '',
					url: job.site,
					mode: job.type === 'full' ? 'fullanalysis' : ( job.type as AnalysisMode ),
					timestamp: job.startedAt,
					pending: true,
					failed,
					status: 'active' as const,
				};
			} );
		const completedReports: Report[] = fetchedReports.map( ( report ) => ( {
			...report,
			status: isArchived( report.id ) ? ( 'archived' as const ) : ( 'active' as const ),
		} ) );
		return [ ...pendingReports, ...completedReports ];
	}, [ fetchedReports, pendingJobs, isArchived ] );

	// Once a pending job is resolved by an R2 entry, tell the parent so it can
	// drop the job from its state + sessionStorage. Without this, resolved jobs
	// would render-filter correctly but accumulate forever in sessionStorage.
	// The filter pattern in the parent's setter makes a no-op call cheap, but we
	// still short-circuit here so we don't fire a state update for every render.
	//
	// Loop-prevention invariant: the parent's handlePendingJobsResolved must
	// return the same array reference when nothing was actually pruned
	// (reference-equality short-circuit in setPendingJobs). Without that, the
	// new pendingJobs prop reference would re-run this effect every render and
	// cause a re-render loop. If you change handlePendingJobsResolved, preserve
	// that short-circuit.
	useEffect( () => {
		if ( ! onPendingJobsResolved || pendingJobs.length === 0 || fetchedReports.length === 0 ) {
			return;
		}
		const resolvedIds = pendingJobs
			.filter( ( job ) => isPendingJobResolved( job, fetchedReports ) )
			.map( ( job ) => job.jobId );
		if ( resolvedIds.length > 0 ) {
			onPendingJobsResolved( resolvedIds );
		}
	}, [ pendingJobs, fetchedReports, onPendingJobsResolved ] );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		type: DATAVIEWS_TABLE,
		fields: [ 'site', 'mode', 'scores', 'timestamp', 'download' ],
		// Default to showing Active reports only. The user can switch to
		// Archived or remove the filter for All via the DataViews filter UI.
		filters: [ { field: 'status', operator: 'is', value: 'active' } ],
		// Default sort newest-first. Pending and failed rows naturally surface
		// at the top because their `startedAt` timestamp is the moment of
		// submission, which is always >= every completed report's timestamp.
		// ISO 8601 strings sort lexicographically the same as chronologically
		// (canonical YYYY-MM-DDTHH:MM:SS.sssZ form), so no custom comparator
		// needed — the timestamp field's getValue returns the raw ISO string
		// and DataViews handles the rest.
		sort: { field: 'timestamp', direction: 'desc' },
		// Override the shared a4a default of 50 — the reports list grows one
		// row per analysis, so 50/page would push pagination controls off
		// indefinitely. 10 keeps the page scannable and surfaces pagination
		// once a Partner Manager has run their 11th analysis. Users can bump
		// this up via the DataViews settings cog (Items per page).
		perPage: 10,
	} );

	// Memoized so the actions array below doesn't recreate on every render,
	// which in turn keeps DataViews from re-mounting the row action menus.
	const handleArchive = useCallback(
		( item: Report ) => {
			archive( item.id );
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_report_archive', {
					report_id: item.id,
					site_url: item.url,
					analysis_type: item.mode,
				} )
			);
			dispatch(
				successNotice( __( 'Report archived.' ), {
					id: 'amplify-report-archive-success',
					duration: 4000,
				} )
			);
		},
		[ archive, dispatch ]
	);

	const handleUnarchive = useCallback(
		( item: Report ) => {
			unarchive( item.id );
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_report_unarchive', {
					report_id: item.id,
					site_url: item.url,
					analysis_type: item.mode,
				} )
			);
			dispatch(
				successNotice( __( 'Report restored.' ), {
					id: 'amplify-report-unarchive-success',
					duration: 4000,
				} )
			);
		},
		[ unarchive, dispatch ]
	);

	// Triggered from the "Amplify now" CTA inside the archived-report
	// popover. Opens the analysis-type modal pre-loaded with this report's
	// site URL, skipping the site picker — the parent (amplify-page.tsx)
	// handles the modal flow via onSiteSelected. The original archived
	// report stays archived; this only kicks off a brand-new analysis for
	// the same site. We also fire a dedicated tracks event so we can tell
	// archive-driven re-runs apart from normal new-analysis flows.
	const handleAmplifyNow = useCallback(
		( item: Report ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_archived_amplify_now_click', {
					report_id: item.id,
					site_url: item.url,
					analysis_type: item.mode,
				} )
			);
			onSiteSelected( item.url );
		},
		[ dispatch, onSiteSelected ]
	);

	// Triggered from the "Try again" CTA inside the failed-report popover.
	// Drops the stale pending row from sessionStorage and opens the analysis
	// modal pre-loaded with the same site so the user can re-run cleanly.
	// We reuse onPendingJobsResolved for the removal — semantically it's
	// "the job is no longer pending in our view", which fits whether the
	// resolution was a real R2 entry or a user-initiated dismissal.
	const handleRetryFailed = useCallback(
		( item: Report ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_report_failed_retry_click', {
					site_url: item.url,
					analysis_type: item.mode,
				} )
			);
			onPendingJobsResolved?.( [ item.id ] );
			onSiteSelected( item.url );
		},
		[ dispatch, onPendingJobsResolved, onSiteSelected ]
	);

	// Triggered from "Archive it" inside the failed-report popover OR from
	// the new Archive action in the row's ellipsis menu (eligible only on
	// failed rows). "Archive" here is user-facing language — mechanically
	// we just remove the stale pending entry from sessionStorage so the
	// row goes away. Pending jobs don't have an R2 entry to flip into the
	// localStorage archive list, and tab-scoped sessionStorage means
	// "archive" can't be undone after a tab close anyway.
	const handleArchiveFailed = useCallback(
		( item: Report ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_report_failed_dismiss_click', {
					site_url: item.url,
					analysis_type: item.mode,
				} )
			);
			onPendingJobsResolved?.( [ item.id ] );
		},
		[ dispatch, onPendingJobsResolved ]
	);

	// Memoized separately so the fields array below doesn't recreate on every render.
	const handleDownload = useCallback(
		( item: Report ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_report_download', {
					report_id: item.id,
					site_url: item.url,
					analysis_type: item.mode,
				} )
			);
			// Validate protocol and domain before opening to guard against a
			// javascript:, data:, or unexpected host URI if the R2 payload were
			// ever tampered with.
			if ( item.pdfUrl ) {
				try {
					const parsed = new URL( item.pdfUrl );
					if (
						parsed.protocol === 'https:' &&
						parsed.hostname === 'pub-d85717c601eb44398d8336c65ac7cfbb.r2.dev'
					) {
						window.open( item.pdfUrl, '_blank', 'noopener,noreferrer' );
					}
				} catch {
					// Invalid URL — do nothing.
				}
			}
		},
		[ dispatch ]
	);

	const fields: Field< Report >[] = useMemo( () => {
		return [
			{
				id: 'site',
				label: __( 'Site' ),
				// Concatenate agencyName and url so DataViews' built-in search
				// matches against either token. Sort order is still effectively
				// alphabetical by agencyName (when present) then url, because the
				// agencyName lands first in the returned string. `enableGlobalSearch`
				// is required for the search box to apply to this field —
				// DataViews ignores fields that don't opt in. (Confirmed against
				// the existing add-site-modal in this same section.)
				getValue: ( { item }: { item: Report } ) =>
					[ item.agencyName, item.url ].filter( Boolean ).join( ' ' ),
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="amplify-reports-site">
						<span className="amplify-reports-site-name">{ item.agencyName || item.url }</span>
						<span className="amplify-reports-site-url">{ item.url }</span>
					</span>
				),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'mode',
				label: __( 'Analysis type' ),
				getValue: ( { item }: { item: Report } ) => MODE_LABELS[ item.mode ] ?? item.mode,
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className={ clsx( 'amplify-reports-badge', `is-${ item.mode }` ) }>
						{ MODE_LABELS[ item.mode ] ?? item.mode }
					</span>
				),
				enableHiding: true,
				enableSorting: true,
			},
			{
				id: 'scores',
				label: __( 'Scores' ),
				getValue: () => '',
				render: ( { item }: { item: Report } ): ReactNode => {
					// Pending and failed rows have no scores — render an em
					// dash placeholder rather than an empty cell so the
					// column visibly tracks the row instead of looking broken.
					if ( item.pending ) {
						return (
							<span
								className="amplify-reports-scores-placeholder"
								aria-label={
									item.failed
										? __( 'Scores unavailable — analysis failed' )
										: __( 'Scores not yet available' )
								}
							>
								—
							</span>
						);
					}
					return (
						<span className="amplify-reports-scores">
							{ item.mode === 'fullanalysis' ? (
								<>
									<ScoreBadge score={ item.humanScore } label={ __( 'Human' ) } />
									<ScoreBadge score={ item.aiScore } label={ __( 'AI' ) } />
								</>
							) : (
								<ScoreBadge
									score={ item.score }
									label={ item.mode === 'human' ? __( 'Human' ) : __( 'AI' ) }
								/>
							) }
						</span>
					);
				},
				enableHiding: true,
				enableSorting: false,
			},
			{
				id: 'timestamp',
				label: __( 'Time & date' ),
				getValue: ( { item }: { item: Report } ) => item.timestamp,
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="amplify-reports-timestamp">{ formatTimestamp( item.timestamp ) }</span>
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'download',
				label: __( 'Download' ),
				getValue: () => '',
				render: ( { item }: { item: Report } ): ReactNode => {
					// `failed` is a stale subset of `pending`, so this branch
					// MUST sit above the plain pending branch — otherwise the
					// failed row would render as "Analysis in progress".
					if ( item.failed ) {
						return (
							<span className="amplify-reports-failed">
								<Gridicon
									className="amplify-reports-failed-icon"
									icon="notice-outline"
									size={ 18 }
								/>
								<span className="amplify-reports-failed-label">{ __( 'Analysis failed' ) }</span>
								<AmplifyInfoPopover ariaLabel={ __( 'About this failed analysis' ) }>
									{ ( { close }: { close: () => void } ) => (
										<div className="amplify-reports-failed-popover">
											<p className="amplify-reports-failed-popover-body">
												{ __(
													'We couldn’t generate this report. The analysis may have timed out or hit an error.'
												) }
											</p>
											{ /* Single CTA — archiving the failed row is still available
											     via the row's ellipsis menu, no need to surface it twice. */ }
											<Button
												variant="link"
												className="amplify-reports-failed-popover-cta"
												onClick={ () => {
													close();
													handleRetryFailed( item );
												} }
											>
												{ __( 'Try again' ) }
											</Button>
										</div>
									) }
								</AmplifyInfoPopover>
							</span>
						);
					}
					if ( item.pending ) {
						return (
							<span className="amplify-reports-in-progress">{ __( 'Analysis in progress' ) }</span>
						);
					}
					if ( item.status === 'archived' ) {
						// Archived reports intentionally hide the Download PDF
						// button. The underlying PDF still lives in R2 and the
						// user can Restore the report from the row's ellipsis
						// menu to get the button back. The popover here tells
						// them why the action is gone and offers an inline
						// "Amplify now" link that kicks off a fresh analysis
						// for the same site. The render-prop form gives us a
						// `close` handle so the popover dismisses cleanly the
						// moment the modal flow takes over — we don't want it
						// to linger underneath the analysis modal.
						return (
							<span className="amplify-reports-archived">
								<span className="amplify-reports-archived-label">{ __( 'Archived' ) }</span>
								<AmplifyInfoPopover ariaLabel={ __( 'About archived reports' ) }>
									{ ( { close }: { close: () => void } ) => (
										<div className="amplify-reports-archived-popover">
											<p className="amplify-reports-archived-popover-body">
												{ __(
													'This report is archived. Sites change quickly. Amplify the site again to see what’s different.'
												) }
											</p>
											<Button
												variant="link"
												className="amplify-reports-archived-popover-cta"
												onClick={ () => {
													close();
													handleAmplifyNow( item );
												} }
											>
												{ __( 'Amplify now' ) }
											</Button>
										</div>
									) }
								</AmplifyInfoPopover>
							</span>
						);
					}
					return (
						<Button
							variant="secondary"
							size="compact"
							icon={ download }
							iconSize={ 16 }
							disabled={ ! item.pdfUrl }
							onClick={ () => handleDownload( item ) }
						>
							{ __( 'Download PDF' ) }
						</Button>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				// Status field exists for filtering (and for filterSortAndPaginate's
				// matcher) — it's not added to the visible `fields` array in the
				// DataViews state, so it doesn't render as a column. The
				// `elements` here populate the All / Active / Archived filter UI.
				id: 'status',
				label: __( 'Status' ),
				getValue: ( { item }: { item: Report } ) => item.status,
				elements: [
					{ value: 'active', label: __( 'Active' ) },
					{ value: 'archived', label: __( 'Archived' ) },
				],
				filterBy: {
					operators: [ 'is' ],
					isPrimary: true,
				},
				enableHiding: true,
				enableSorting: false,
			},
		];
	}, [ handleDownload, handleAmplifyNow, handleRetryFailed ] );

	// DataViews actions appear in a built-in column at the end of each row.
	// `isPrimary: false` puts them under the row's ellipsis menu rather than
	// rendering an inline button. `isEligible` is evaluated per row so we
	// hide Archive on already-archived (and pending) reports, and hide
	// Restore on active ones.
	const actions: Action< Report >[] = useMemo(
		() => [
			{
				id: 'archive-report',
				label: __( 'Archive' ),
				isPrimary: false,
				callback: ( items: Report[] ) => {
					const report = items[ 0 ];
					if ( report ) {
						handleArchive( report );
					}
				},
				// Eligible only for active completed reports — not for pending,
				// not for already-archived, and not for failed (failed rows
				// have their own Archive action below that hits the right
				// dismiss path).
				isEligible: ( item: Report ) =>
					! item.pending && ! item.failed && item.status !== 'archived',
			},
			{
				id: 'unarchive-report',
				label: __( 'Restore' ),
				isPrimary: false,
				callback: ( items: Report[] ) => {
					const report = items[ 0 ];
					if ( report ) {
						handleUnarchive( report );
					}
				},
				isEligible: ( item: Report ) =>
					! item.pending && ! item.failed && item.status === 'archived',
			},
			{
				// Failed-row archive surfaces the same removal we offer
				// inside the popover, just as an ellipsis-menu shortcut so
				// users can clear the row without opening the popover first.
				id: 'archive-failed-report',
				label: __( 'Archive' ),
				isPrimary: false,
				callback: ( items: Report[] ) => {
					const report = items[ 0 ];
					if ( report ) {
						handleArchiveFailed( report );
					}
				},
				isEligible: ( item: Report ) => !! item.failed,
			},
		],
		[ handleArchive, handleUnarchive, handleArchiveFailed ]
	);

	const { data: items, paginationInfo: pagination } = useMemo( () => {
		return filterSortAndPaginate( reports, dataViewsState, fields );
	}, [ reports, dataViewsState, fields ] );

	if ( isLoading ) {
		return <div className="amplify-reports-loading">{ __( 'Loading reports…' ) }</div>;
	}

	// Show the empty / prompt state only when there are truly no rows to display
	// (no R2 reports and no pending jobs). A fetch error alone is not enough to
	// hide pending rows — if R2 is unavailable the in-progress jobs should still
	// be visible in the table.
	if ( reports.length === 0 ) {
		return (
			<div className="amplify-reports-empty">
				<p className="amplify-reports-empty-heading">
					{ error
						? __( 'Unable to load reports. Please refresh to try again.' )
						: __( "You haven't run any Amplify analyses yet." ) }
				</p>
				{ ! error && <AmplifySiteSelect onSiteSelected={ onSiteSelected } /> }
			</div>
		);
	}

	return (
		<div className="amplify-reports redesigned-a8c-table full-width">
			{ error && (
				<p className="amplify-reports-fetch-error">
					{ __( 'Could not load previous reports. Showing in-progress jobs only.' ) }
				</p>
			) }
			<ItemsDataViews
				data={ {
					items,
					getItemId: ( item: Report ) => item.id,
					pagination,
					enableSearch: true,
					searchLabel: __( 'Search by site or URL' ),
					fields,
					actions,
					setDataViewsState,
					dataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
