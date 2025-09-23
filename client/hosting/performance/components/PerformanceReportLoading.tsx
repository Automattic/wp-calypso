import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { PerformanceReportLoadingProgress } from 'calypso/performance-profiler/pages/loading-screen/progress';

export const PerformanceReportLoading = ( {
	isSavedReport,
	pageTitle,
	isLoadingPages,
	onRetestClick,
}: {
	isSavedReport: boolean;
	pageTitle: string;
	isLoadingPages?: boolean;
	onRetestClick(): void;
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
				isSavedReport={ isSavedReport }
				pageTitle={ pageTitle }
				isLoadingPages={ isLoadingPages }
			/>
			{ ! isLoadingPages && (
				<p>
					{ createInterpolateElement(
						__(
							'Your report is on the way — this usually takes about 30 seconds.<br />You can <button>start a fresh test</button> anytime if needed.'
						),
						{
							button: (
								<Button
									variant="link"
									style={ { fontSize: 'inherit' } }
									onClick={ onRetestClick }
								/>
							),
							br: <br />,
						}
					) }
				</p>
			) }
		</div>
	);
};
