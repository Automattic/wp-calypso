import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useResizeObserver } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import './style.scss';

type PerformanceScoreProps = {
	value: number;
	recommendationsQuantity?: number;
	recommendationsRef: React.RefObject< HTMLDivElement > | null;
};

const MAX_SCORE_BAR_WIDTH = 600;

export const PerformanceScore = ( props: PerformanceScoreProps ) => {
	const translate = useTranslate();
	const [ resizeObserverRef, entry ] = useResizeObserver();
	const [ scoreBarWidth, setScoreBarWidth ] = useState( MAX_SCORE_BAR_WIDTH );
	const isMobile = useMobileBreakpoint();

	const { value, recommendationsQuantity, recommendationsRef } = props;
	const getStatus = ( value: number ) => {
		if ( value <= 49 ) {
			return 'poor';
		} else if ( value > 49 && value < 90 ) {
			return 'neutral';
		}
		return 'good';
	};
	const status = getStatus( value );
	const statusText = {
		poor: translate( 'Poor' ),
		neutral: translate( 'Needs improvement' ),
		good: translate( 'Excellent' ),
	}[ status ];

	useEffect( () => {
		if ( ! entry ) {
			return;
		}

		const width = entry.width ?? MAX_SCORE_BAR_WIDTH;
		setScoreBarWidth( width >= MAX_SCORE_BAR_WIDTH ? MAX_SCORE_BAR_WIDTH : width );
	}, [ entry ] );

	const viewRecommendationsOnClick = () => {
		recommendationsRef?.current?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
	};

	return (
		<div className="performance-profiler-performance-score">
			{ resizeObserverRef }
			<div className="score-summary">
				<div className="title">{ translate( 'Performance Score' ) }</div>
				<div className={ clsx( 'score', { mobile: isMobile } ) }>
					<span className="current-score">{ Math.floor( value ) }</span>
					<span className="max-score">/ 100</span>
				</div>

				<div className="score-bar">
					<div className="full-bar" style={ { width: scoreBarWidth } } />
					<div
						className={ clsx( 'current-value-bar', {
							[ status ]: true,
						} ) }
						style={ { width: ( scoreBarWidth / 100 ) * value } }
					/>
				</div>
			</div>
			<div className="status">
				<div className={ clsx( 'status-badge', { [ status ]: true } ) }>{ statusText }</div>
				<div className="recommendations-text">
					{ recommendationsQuantity
						? translate(
								'We found %(quantity)d way to improve your site‘s performance. {{a}}View your personalized recommendation{{/a}}',
								'We found %(quantity)d ways to improve your site‘s performance. {{a}}View your personalized recommendations{{/a}}',
								{
									count: recommendationsQuantity,
									args: { quantity: recommendationsQuantity },
									components: {
										a: (
											/* eslint-disable-next-line jsx-a11y/anchor-is-valid */
											<a
												onClick={ viewRecommendationsOnClick }
												role="button"
												tabIndex={ 0 }
												onKeyUp={ viewRecommendationsOnClick }
											/>
										),
									},
								}
						  )
						: translate(
								'We didn‘t find any recommendations for improving the speed of your site.'
						  ) }
				</div>
			</div>
			<div className="disclaimer">
				{ translate(
					'The performance score is a combined representation of your site‘s individual speed metrics. {{link}}See calculator ↗{{/link}}',
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
