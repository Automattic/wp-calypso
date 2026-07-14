import { Badge } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { DataViews } from 'calypso/components/dataviews';
import EmptyState from 'calypso/dashboard/components/empty-state';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useAmplifyReportRows, { AmplifyReportRow } from './use-report-rows';
import type { BadgeType } from '@automattic/components';
import type { Field } from '@wordpress/dataviews';
import type { AmplifyMode } from 'calypso/a8c-for-agencies/data/amplify/types';
import type { ReactNode } from 'react';

import './reports-content.scss';

function modeLabel( mode: AmplifyMode ): string {
	switch ( mode ) {
		case 'human':
			return __( 'Human' );
		case 'ai':
			return __( 'AI' );
		case 'full':
			return __( 'Full' );
		default:
			return mode;
	}
}

const MODE_BADGE_TYPE: Record< AmplifyMode, BadgeType > = {
	human: 'info-blue',
	ai: 'info-purple',
	full: 'info-green',
};

function formatTimestamp( iso: string ): string {
	return new Date( iso ).toLocaleString( undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	} );
}

function ScoreBadge( { score, label }: { score: number | null; label: string } ) {
	if ( score === null ) {
		return null;
	}
	let type: BadgeType;
	if ( score >= 80 ) {
		type = 'success';
	} else if ( score >= 50 ) {
		type = 'warning';
	} else {
		type = 'error';
	}
	return (
		<Badge type={ type }>
			{ sprintf(
				/* translators: %1$s is the score label (e.g. Human), %2$d is the numeric score */
				__( '%1$s %2$d' ),
				label,
				score
			) }
		</Badge>
	);
}

export default function AmplifyReportsContent() {
	const dispatch = useDispatch();
	const { rows, isLoading, error } = useAmplifyReportRows();

	// Align the toolbar controls with the table's column padding: 64px on wide
	// viewports, 16px once the table switches to its narrow padding.
	const isNarrowView = useBreakpoint( '<660px' );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		type: DATAVIEWS_TABLE,
		fields: [ 'site', 'mode', 'scores', 'timestamp', 'download' ],
		sort: { field: 'timestamp', direction: 'desc' },
		perPage: 10,
		layout: {
			styles: {
				site: { width: '30%' },
				mode: { width: '16%' },
				scores: { width: '18%' },
				timestamp: { width: '18%' },
				download: { width: '18%' },
			},
		},
	} );

	const fields: Field< AmplifyReportRow >[] = useMemo(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item }: { item: AmplifyReportRow } ) => item.url,
				render: ( { item }: { item: AmplifyReportRow } ): ReactNode => (
					<Text weight={ 500 } truncate>
						{ item.url }
					</Text>
				),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'mode',
				label: __( 'Analysis type' ),
				getValue: ( { item }: { item: AmplifyReportRow } ) => modeLabel( item.mode ),
				render: ( { item }: { item: AmplifyReportRow } ): ReactNode => (
					<Badge
						type={ MODE_BADGE_TYPE[ item.mode ] }
						className={ `amplify-report-mode-badge is-${ item.mode }` }
					>
						{ modeLabel( item.mode ) }
					</Badge>
				),
				enableHiding: true,
				enableSorting: true,
			},
			{
				id: 'scores',
				label: __( 'Scores' ),
				getValue: () => '',
				render: ( { item }: { item: AmplifyReportRow } ): ReactNode => {
					if ( item.rowStatus !== 'completed' ) {
						return (
							<Text variant="muted" aria-label={ __( 'Scores not available' ) }>
								—
							</Text>
						);
					}
					return (
						<HStack spacing={ 2 } justify="flex-start" expanded={ false } wrap>
							{ item.mode === 'full' ? (
								<>
									<ScoreBadge score={ item.humanScore } label={ __( 'Human' ) } />
									<ScoreBadge score={ item.aiScore } label={ __( 'AI' ) } />
								</>
							) : (
								<ScoreBadge
									score={ item.mode === 'human' ? item.humanScore : item.aiScore }
									label={ item.mode === 'human' ? __( 'Human' ) : __( 'AI' ) }
								/>
							) }
						</HStack>
					);
				},
				enableHiding: true,
				enableSorting: false,
			},
			{
				id: 'timestamp',
				label: __( 'Time & date' ),
				getValue: ( { item }: { item: AmplifyReportRow } ) => item.timestamp,
				render: ( { item }: { item: AmplifyReportRow } ): ReactNode => (
					<Text variant="muted">{ item.timestamp ? formatTimestamp( item.timestamp ) : '—' }</Text>
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'download',
				label: __( 'Download' ),
				getValue: () => '',
				render: ( { item }: { item: AmplifyReportRow } ): ReactNode => {
					if ( item.rowStatus === 'failed' ) {
						return (
							<Badge type="error" title={ item.failureReason }>
								{ __( 'Analysis failed' ) }
							</Badge>
						);
					}
					if ( item.rowStatus === 'in_progress' ) {
						return (
							<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
								<Spinner />
								<Text variant="muted">{ __( 'Analysis in progress' ) }</Text>
							</HStack>
						);
					}
					return (
						<Button
							variant="secondary"
							size="compact"
							icon={ download }
							iconSize={ 16 }
							href={ item.pdfUrl ?? undefined }
							target="_blank"
							rel="noopener noreferrer"
							disabled={ ! item.pdfUrl }
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_a4a_amplify_report_download_click', {
										report_id: item.id,
										mode: item.mode,
									} )
								);
							} }
						>
							{ __( 'Download PDF' ) }
						</Button>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ dispatch ]
	);

	const { data: items, paginationInfo: pagination } = useMemo(
		() => filterSortAndPaginate( rows, dataViewsState, fields ),
		[ rows, dataViewsState, fields ]
	);

	if ( isLoading ) {
		return (
			<VStack alignment="center" justify="center" spacing={ 3 } style={ { minBlockSize: '240px' } }>
				<Spinner />
				<Text variant="muted">{ __( 'Loading reports…' ) }</Text>
			</VStack>
		);
	}

	if ( rows.length === 0 ) {
		return (
			<EmptyState.Wrapper isBorderless>
				<EmptyState>
					<EmptyState.Header>
						<EmptyState.Title>
							{ error ? __( 'Unable to load reports' ) : __( 'No reports yet' ) }
						</EmptyState.Title>
						<EmptyState.Description>
							{ error
								? __( 'Something went wrong. Please refresh to try again.' )
								: __( 'Amplify analyses you run will appear here.' ) }
						</EmptyState.Description>
					</EmptyState.Header>
				</EmptyState>
			</EmptyState.Wrapper>
		);
	}

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items,
					getItemId: ( item: AmplifyReportRow ) => item.id,
					pagination,
					enableSearch: true,
					searchLabel: __( 'Search by URL' ),
					fields,
					setDataViewsState,
					dataViewsState,
					defaultLayouts: { table: {} },
				} }
			>
				<HStack
					className="dataviews__view-actions"
					justify="space-between"
					style={ { paddingInline: isNarrowView ? '16px' : '64px' } }
				>
					<DataViews.Search />
					<DataViews.ViewConfig />
				</HStack>
				<DataViews.Layout />
				<DataViews.Footer />
			</ItemsDataViews>
		</div>
	);
}
