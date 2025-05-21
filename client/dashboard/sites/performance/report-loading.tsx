import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PerformanceReportLoadingProgress } from 'calypso/performance-profiler/pages/loading-screen/progress';

export default function ReportLoading( {
	isSavedReport,
	pageTitle,
}: {
	isSavedReport: boolean;
	pageTitle: string;
} ) {
	return (
		<>
			<PerformanceReportLoadingProgress
				css={ {
					span: {
						fontSize: '14px',
						lineHeight: '20px',
					},
				} }
				isSavedReport={ isSavedReport }
				pageTitle={ pageTitle }
				isLoadingPages={ false }
			/>
			{ ! isSavedReport && (
				<Text style={ { display: 'block', marginTop: '32px' } }>
					{ __( 'Testing your site may take around 30 seconds.' ) }
				</Text>
			) }
		</>
	);
}
