import { PerformanceReport, ScreenShotsTimeLine } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsDisplay } from 'calypso/performance-profiler/components/core-web-vitals-display';
import Image from 'calypso/performance-profiler/components/image';
import { InsightsSection } from 'calypso/performance-profiler/components/insights-section';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
}: PerformanceProfilerDashboardContentProps ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb, audits, history } = performanceReport;

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
			<div className="l-block-wrapper container">
				<div className="top-section">
					<PerformanceScore value={ overall_score * 100 } />
					<Image
						className="thumbnail screenshot"
						src={ getScreenShotUrl( performanceReport?.screenshots ) ?? '' }
					/>
				</div>
				<CoreWebVitalsDisplay
					fcp={ fcp }
					lcp={ lcp }
					cls={ cls }
					inp={ inp }
					ttfb={ ttfb }
					history={ history }
				/>
				<div className="timeline-container">
					<h1>Timeline</h1>
					<p>Screenshots of your site loading taken while loading the page. </p>
					{ renderScreenShotsTimeLine( performanceReport?.screenshots ) }
				</div>
				{ audits && <InsightsSection audits={ audits } /> }
			</div>
		</div>
	);
};
