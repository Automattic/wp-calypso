import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

type AnalysisType = 'human' | 'ai' | 'full';

type Report = {
	id: string;
	site: string;
	analysisType: AnalysisType;
	timestamp: string;
};

const REPORTS: Report[] = [
	{ id: '1', site: 'brightleaf.studio', analysisType: 'human', timestamp: '2026-04-28T15:42:00Z' },
	{ id: '2', site: 'pixelcraft.agency', analysisType: 'ai', timestamp: '2026-04-28T11:18:00Z' },
	{ id: '3', site: 'novastudio.design', analysisType: 'full', timestamp: '2026-04-27T17:21:00Z' },
	{ id: '4', site: 'webweavers.co', analysisType: 'human', timestamp: '2026-04-26T09:04:00Z' },
	{
		id: '5',
		site: 'crestlinestudio.com',
		analysisType: 'full',
		timestamp: '2026-04-25T14:33:00Z',
	},
	{ id: '6', site: 'atlasdigital.io', analysisType: 'ai', timestamp: '2026-04-24T10:57:00Z' },
	{ id: '7', site: 'unityworks.studio', analysisType: 'human', timestamp: '2026-04-22T16:09:00Z' },
	{ id: '8', site: 'forgemedia.co', analysisType: 'full', timestamp: '2026-04-21T13:48:00Z' },
	{
		id: '9',
		site: 'canopycollective.com',
		analysisType: 'ai',
		timestamp: '2026-04-19T08:12:00Z',
	},
	{
		id: '10',
		site: 'lightspring.agency',
		analysisType: 'full',
		timestamp: '2026-04-17T15:55:00Z',
	},
	{ id: '11', site: 'orbitcreative.io', analysisType: 'human', timestamp: '2026-04-14T11:30:00Z' },
	{ id: '12', site: 'relayhq.studio', analysisType: 'ai', timestamp: '2026-04-10T18:02:00Z' },
];

function formatTimestamp( iso: string ): string {
	return new Date( iso ).toLocaleString( undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	} );
}

export default function AmplifyReportsContent() {
	const dispatch = useDispatch();
	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		type: DATAVIEWS_TABLE,
		fields: [ 'site', 'analysisType', 'timestamp', 'download' ],
	} );

	const fields: Field< Report >[] = useMemo( () => {
		const analysisLabels: Record< AnalysisType, string > = {
			human: __( 'Human' ),
			ai: __( 'AI' ),
			full: __( 'Full' ),
		};

		const handleDownload = ( item: Report ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_amplify_report_download', {
					report_id: item.id,
					site_url: item.site,
					analysis_type: item.analysisType,
				} )
			);
		};

		return [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item }: { item: Report } ) => item.site,
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="amplify-reports-site">{ item.site }</span>
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'analysisType',
				label: __( 'Analysis type' ),
				getValue: ( { item }: { item: Report } ) => analysisLabels[ item.analysisType ],
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className={ clsx( 'amplify-reports-badge', `is-${ item.analysisType }` ) }>
						{ analysisLabels[ item.analysisType ] }
					</span>
				),
				enableHiding: true,
				enableSorting: true,
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
				render: ( { item }: { item: Report } ): ReactNode => (
					<Button
						variant="secondary"
						size="compact"
						icon={ download }
						iconSize={ 16 }
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
		return filterSortAndPaginate( REPORTS, dataViewsState, fields );
	}, [ dataViewsState, fields ] );

	return (
		<div className="amplify-reports redesigned-a8c-table full-width">
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
