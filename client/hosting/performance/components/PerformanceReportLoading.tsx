import { useI18n } from '@wordpress/react-i18n';
import { PerformanceReportLoadingProgress } from 'calypso/performance-profiler/pages/loading-screen/progress';

export const PerformanceReportLoading = ( {
	isSavedReport,
	pageTitle,
	isLoadingPages,
}: {
	isSavedReport: boolean;
	pageTitle: string;
	isLoadingPages?: boolean;
} ) => {
	const { __ } = useI18n();

	return (
		<div css={ { display: 'flex', flexDirection: 'column', gap: '64px' } }>
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
		</div>
	);
};
