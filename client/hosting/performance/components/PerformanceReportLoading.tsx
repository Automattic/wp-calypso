import { Button } from '@wordpress/components';
import { createInterpolateElement, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { PerformanceReportLoadingProgress } from 'calypso/performance-profiler/pages/loading-screen/progress';

export const PerformanceReportLoading = ( {
	isSavedReport,
	pageTitle,
	isLoadingPages,
	onRetestClick,
}: {
	isSavedReport?: boolean;
	pageTitle?: string;
	isLoadingPages?: boolean;
	onRetestClick?(): void;
} ) => {
	const { __ } = useI18n();
	const [ isButtonClicked, setIsButtonClicked ] = useState( false );

	const handleRetestClick = () => {
		setIsButtonClicked( true );
		onRetestClick?.();
	};

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
					{ __( 'Your report is on the way — this usually takes about 30 seconds.' ) }
					<br />
					{ ! isButtonClicked &&
						createInterpolateElement(
							__( 'You can <button>start a fresh test</button> anytime if needed.' ),
							{
								button: (
									<Button
										variant="link"
										style={ { fontSize: 'inherit' } }
										onClick={ handleRetestClick }
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
