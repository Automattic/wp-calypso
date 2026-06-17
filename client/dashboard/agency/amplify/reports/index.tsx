import { activeAgencyQuery, amplifyReportsQuery, amplifyJobsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { useReportFields } from './fields';
import { toRows } from './to-rows';
import { DEFAULT_LAYOUTS, DEFAULT_VIEW } from './views';
import type { AmplifyReportRow } from './types';
import type { Action, View } from '@wordpress/dataviews';

function AmplifyReportsList( { agencyId }: { agencyId: number } ) {
	const { recordTracksEvent } = useAnalytics();
	const fields = useReportFields();
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { data: reports } = useSuspenseQuery( amplifyReportsQuery( agencyId ) );
	const { data: jobs } = useSuspenseQuery( amplifyJobsQuery( agencyId ) );

	const rows = toRows( reports, jobs );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( rows, view, fields );

	const actions: Action< AmplifyReportRow >[] = [
		{
			id: 'download-pdf',
			label: __( 'Download PDF' ),
			isPrimary: true,
			isEligible: ( item ) => item.status === 'completed' && !! item.pdfUrl,
			callback: ( items ) => {
				const item = items[ 0 ];
				if ( ! item.pdfUrl ) {
					return;
				}
				recordTracksEvent( 'calypso_a4a_amplify_report_download', {
					report_id: item.id,
					site_url: item.url,
					analysis_type: item.mode,
				} );
				window.open( item.pdfUrl, '_blank', 'noreferrer' );
			},
		},
	];

	const hasRows = rows.length > 0;

	return (
		<PageLayout header={ <PageHeader title={ __( 'Amplify reports' ) } /> }>
			{ ! hasRows ? (
				<DataViewsEmptyStateLayout
					title={ __( 'No reports yet' ) }
					description={ __( 'Run an analysis from the Amplify overview to see reports here.' ) }
				/>
			) : (
				<DataViewsCard>
					<DataViews< AmplifyReportRow >
						data={ filteredData || [] }
						fields={ fields }
						view={ view }
						onChangeView={ setView }
						actions={ actions }
						search
						paginationInfo={ paginationInfo }
						getItemId={ ( item ) => item.id }
						defaultLayouts={ DEFAULT_LAYOUTS }
						empty={
							<DataViewsEmptyStateLayout
								title={ __( 'No reports match your search' ) }
								description={ __( 'Try a different search or filter.' ) }
								isBorderless
							/>
						}
					/>
				</DataViewsCard>
			) }
		</PageLayout>
	);
}

export default function AgencyAmplifyReports() {
	const { data: agency } = useQuery( activeAgencyQuery() );

	if ( ! agency ) {
		return <PageLayout header={ <PageHeader title={ __( 'Amplify reports' ) } /> } />;
	}

	return <AmplifyReportsList agencyId={ agency.id } />;
}
