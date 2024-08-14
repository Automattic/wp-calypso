import { PerformanceReport, ScreenShotsTimeLine } from 'calypso/data/site-profiler/types';
import Image from 'calypso/performance-profiler/components/image';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport?: PerformanceReport;
};

export const PerformanceProfilerDashboardContent = (
	props: PerformanceProfilerDashboardContentProps
) => {
	const { performanceReport } = props;

	const getScreenShotUrl = ( screenshots: ScreenShotsTimeLine[] | undefined ) => {
		if ( ! screenshots || ! screenshots.length ) {
			return null;
		}

		return screenshots[ screenshots.length - 1 ].data;
	};

	const renderScreenShotsTimeLine = ( screenshots: ScreenShotsTimeLine[] | undefined ) => {
		if ( ! screenshots || ! screenshots.length ) {
			return null;
		}

		return (
			<div className="timeline">
				{ screenshots.map( ( screenshot, index ) => (
					<div key={ index }>
						<Image className="thumbnail" src={ screenshot.data } />
						<p>{ ( screenshot.timing / 1000 ).toFixed( 1 ) }s</p>
					</div>
				) ) }
			</div>
		);
	};

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper">
				<div className="top-section">
					{ performanceReport?.overall_score && (
						<PerformanceScore value={ performanceReport.overall_score * 100 } />
					) }

					<Image
						className="thumbnail screenshot"
						src={ getScreenShotUrl( performanceReport?.screenshots ) ?? '' }
					/>
				</div>

				<div className="timeline-container">
					<h1>Timeline</h1>
					<p>Screenshots of your site loading taken while loading the page. </p>
					{ renderScreenShotsTimeLine( performanceReport?.screenshots ) }
				</div>
			</div>
		</div>
	);
};
