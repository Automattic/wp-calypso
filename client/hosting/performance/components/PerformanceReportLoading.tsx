import { useI18n } from '@wordpress/react-i18n';
import { PerformanceReportLoadingProgress } from 'calypso/performance-profiler/pages/loading-screen/progress';

export const PerformanceReportLoading = ( {
	isSavedReport,
	pageTitle,
	isLoadingPages,
	isLoggedIn,
}: {
	isSavedReport: boolean;
	pageTitle: string;
	isLoadingPages?: boolean;
	isLoggedIn?: boolean;
} ) => {
	const { __ } = useI18n();

	return (
		<div className="site-performance__loader">
			<PerformanceReportLoadingProgress
				css={ {
					span: {
						fontSize: '14px',
						lineHeight: '20px',
					},
				} }
				pageTitle={ pageTitle }
				isLoadingPages={ isLoadingPages }
				isSavedReport={ isSavedReport }
				isLoggedIn={ isLoggedIn }
			/>
			{ ! isLoadingPages && <p>{ __( 'Testing your site may take around 30 seconds.' ) }</p> }
		</div>
	);
};
