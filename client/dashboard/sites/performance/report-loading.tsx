import { __ } from '@wordpress/i18n';
import { PerformanceReportLoadingProgress } from 'calypso/performance-profiler/pages/loading-screen/progress';

export const ReportLoading = ( {
	isSavedReport,
	pageTitle,
	isLoadingPages,
}: {
	isSavedReport: boolean;
	pageTitle: string;
	isLoadingPages?: boolean;
} ) => {
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
				isLoadingPages={ isLoadingPages }
			/>
			{ ! isLoadingPages && <p>{ __( 'Testing your site may take around 30 seconds.' ) }</p> }
		</>
	);
};
