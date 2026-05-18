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
import AmplifySiteSelect from './amplify-site-select';
import type { PendingJob } from './amplify-analysis-modal';
import type { Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

type AnalysisMode = 'human' | 'ai' | 'fullanalysis';

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
};

const INDEX_URL = 'https://pub-d85717c601eb44398d8336c65ac7cfbb.r2.dev/reports/index.json';

const MODE_LABELS: Record< AnalysisMode, string > = {
	human: 'Human',
	ai: 'AI',
	fullanalysis: 'Full',
};

function useAmplifyReports(): { reports: Report[]; isLoading: boolean; error: string | null } {
	const [ reports, setReports ] = useState< Report[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		let cancelled = false;

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
				if ( ! cancelled ) {
					setReports( Array.isArray( data.reports ) ? data.reports : [] );
				}
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

		return () => {
			cancelled = true;
		};
	}, [] );

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
}: {
	pendingJobs?: PendingJob[];
	onSiteSelected: ( url: string ) => void;
} ) {
	const dispatch = useDispatch();
	const { reports: fetchedReports, isLoading, error } = useAmplifyReports();

	// Merge pending jobs into the reports list. A pending job is shown at the
	// top with the `pending` flag set. Once the R2 index updates and a real
	// report with the same site + mode appears, the pending row will naturally
	// be replaced on the next fetch (page reload). We deduplicate by jobId so a
	// pending row never shows alongside the completed report for the same run.
	// Memoized so that table interactions (sort/filter/paginate) that trigger a
	// re-render don't rebuild the Set and re-map the arrays unnecessarily.
	const reports = useMemo( () => {
		const completedJobIds = new Set( fetchedReports.map( ( r ) => r.id ) );
		const pendingReports: Report[] = pendingJobs
			.filter( ( job ) => ! completedJobIds.has( job.jobId ) )
			.map( ( job ) => ( {
				id: job.jobId,
				agencyName: '',
				url: job.site,
				mode: job.type === 'full' ? 'fullanalysis' : ( job.type as AnalysisMode ),
				timestamp: job.startedAt,
				pending: true,
			} ) );
		return [ ...pendingReports, ...fetchedReports ];
	}, [ fetchedReports, pendingJobs ] );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		type: DATAVIEWS_TABLE,
		fields: [ 'site', 'mode', 'scores', 'timestamp', 'download' ],
	} );

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
				getValue: ( { item }: { item: Report } ) => item.agencyName || item.url,
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="amplify-reports-site">
						<span className="amplify-reports-site-name">{ item.agencyName || item.url }</span>
						<span className="amplify-reports-site-url">{ item.url }</span>
					</span>
				),
				enableHiding: false,
				enableSorting: true,
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
				render: ( { item }: { item: Report } ): ReactNode => (
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
				),
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
				render: ( { item }: { item: Report } ): ReactNode =>
					item.pending ? (
						<span className="amplify-reports-in-progress">{ __( 'Report in progress' ) }</span>
					) : (
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
					),
				enableHiding: false,
				enableSorting: false,
			},
		];
	}, [ dispatch ] );

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
					enableSearch: false,
					fields,
					actions: [],
					setDataViewsState,
					dataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
