import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type PerformanceScoreProps = {
	value: number;
};

const SCORE_BAR_WIDTH = 280;

export const PerformanceScore = ( props: PerformanceScoreProps ) => {
	const translate = useTranslate();
	const { value } = props;

	return (
		<div className="performance-profiler-performance-score">
			<div className="score-summary">
				<div className="title">{ translate( 'Performance Score' ) }</div>
				<div className="score">{ Math.floor( value ) }</div>

				<div className="score-bar">
					<div className="full-bar" style={ { width: SCORE_BAR_WIDTH } } />
					<div
						className={ clsx( 'current-value-bar', {
							poor: value <= 49,
							neutral: value > 49 && value < 90,
							good: value >= 90,
						} ) }
						style={ { width: ( SCORE_BAR_WIDTH / 100 ) * value } }
					/>
				</div>
			</div>

			<div className="disclaimer">
				{ translate(
					"The performance score is a combined representation of your site's individual speed metrics. {{link}}See calculator ↗{{/link}}",
					{
						components: {
							link: (
								<a
									href="https://developer.chrome.com/docs/lighthouse/performance/performance-scoring"
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</div>
		</div>
	);
};
