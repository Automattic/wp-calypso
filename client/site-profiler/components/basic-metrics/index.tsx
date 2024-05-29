import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ForwardedRef, forwardRef } from 'react';
import { BASIC_METRICS_UNITS } from 'calypso/data/site-profiler/metrics-dictionaries';
import { calculateMetricsSectionScrollOffset } from 'calypso/site-profiler/utils/calculate-metrics-section-scroll-offset';
import type { BasicMetricsScored, Metrics, Scores } from 'calypso/data/site-profiler/types';
import './styles.scss';

const Container = styled.div`
	scroll-margin-top: ${ calculateMetricsSectionScrollOffset }px;
`;

const SubtitleIcon = styled( Gridicon )`
	transform: translate( 0, 3px );
	margin-left: 8px;
`;

function getIcon( score: Scores ) {
	switch ( score ) {
		case 'good':
			return 'checkmark';
		case 'poor':
			return 'info-outline';
		default:
			return 'info-outline';
	}
}

type BasicMetricProps = {
	metric: Metrics;
	basicMetrics: BasicMetricsScored;
	name: string;
	positiveHeading: string;
	negativeHeading: string;
	positiveSubheading: string;
	negativeSubheading: string;
	url: string;
	urlText: string;
};

export const BasicMetric = ( {
	metric,
	basicMetrics,
	name,
	positiveHeading,
	negativeHeading,
	positiveSubheading,
	negativeSubheading,
	url,
	urlText,
}: BasicMetricProps ) => {
	const { value, score } = basicMetrics[ metric ];
	const showMetric = value !== undefined && value !== null;
	const isPositiveScore = score === 'good';

	return (
		showMetric && (
			<div className="basic-metrics__card">
				<div className={ classNames( 'basic-metrics__header', score ) }>
					<div className="basic-metrics__name">
						<Gridicon size={ 18 } icon={ getIcon( score ) } />
						{ name }
					</div>
					<div className="basic-metrics__value">
						{ value }
						{ BASIC_METRICS_UNITS[ metric ] }
					</div>
				</div>
				<h3>{ isPositiveScore ? positiveHeading : negativeHeading }</h3>
				<h4>{ isPositiveScore ? positiveSubheading : negativeSubheading }</h4>
				<a href={ url }>
					{ urlText }
					<SubtitleIcon icon="chevron-right" size={ 18 } />
				</a>
			</div>
		)
	);
};

export const BasicMetrics = forwardRef(
	(
		{ basicMetrics }: { basicMetrics: BasicMetricsScored },
		ref: ForwardedRef< HTMLObjectElement >
	) => {
		const translate = useTranslate();

		return (
			<Container className="basic-metrics" ref={ ref }>
				<div className="basic-metric-details result-list">
					<BasicMetric
						metric="cls"
						basicMetrics={ basicMetrics }
						name={ translate( 'Cumulative Layout Shift' ) }
						positiveHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						negativeHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						positiveSubheading={ translate(
							'WordPress.com’s optimized themes can reduce layout shifts, providing a more stable and enjoyable experience.'
						) }
						negativeSubheading={ translate(
							'WordPress.com’s optimized themes can reduce layout shifts, providing a more stable and enjoyable experience.'
						) }
						url="https://wordpress.com/start/"
						urlText={ translate( 'Stabilize with us' ) }
					/>
					<BasicMetric
						metric="fid"
						basicMetrics={ basicMetrics }
						name={ translate( 'First Input Delay' ) }
						positiveHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						negativeHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						positiveSubheading={ translate(
							'WordPress.com’s optimized themes can reduce layout shifts, providing a more stable and enjoyable experience.'
						) }
						negativeSubheading={ translate(
							'WordPress.com’s optimized themes can reduce layout shifts, providing a more stable and enjoyable experience.'
						) }
						url="https://wordpress.com/start/"
						urlText={ translate( 'Stabilize with us' ) }
					/>
					<BasicMetric
						metric="lcp"
						basicMetrics={ basicMetrics }
						name={ translate( 'Largest Contentful Paint' ) }
						positiveHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						negativeHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						positiveSubheading={ translate(
							'WordPress.com’s efficient resource management ensures faster responses to user actions.'
						) }
						negativeSubheading={ translate(
							'WordPress.com’s efficient resource management ensures faster responses to user actions.'
						) }
						url="https://wordpress.com/start/"
						urlText={ translate( 'Boost interactivity' ) }
					/>
					<BasicMetric
						metric="fcp"
						basicMetrics={ basicMetrics }
						name={ translate( 'First Contentful Paint' ) }
						positiveHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						negativeHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						positiveSubheading={ translate(
							'Maintain this performance by using best practices for layout stability, ensuring content remains stable as it loads.'
						) }
						negativeSubheading={ translate(
							'Maintain this performance by using best practices for layout stability, ensuring content remains stable as it loads.'
						) }
						url="https://wordpress.com/start/"
						urlText={ translate( 'Keep layout stable' ) }
					/>
					<BasicMetric
						metric="ttfb"
						basicMetrics={ basicMetrics }
						name={ translate( 'Time to First Byte' ) }
						positiveHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						negativeHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						positiveSubheading={ translate(
							'WordPress.com’s optimized themes can reduce layout shifts, providing a more stable and enjoyable experience.'
						) }
						negativeSubheading={ translate(
							'WordPress.com’s optimized themes can reduce layout shifts, providing a more stable and enjoyable experience.'
						) }
						url="https://wordpress.com/themes/"
						urlText={ translate( 'Load faster with us' ) }
					/>
					<BasicMetric
						metric="inp"
						basicMetrics={ basicMetrics }
						name={ translate( 'Interaction to Next Paint' ) }
						positiveHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						negativeHeading={ translate(
							'Your site experiences more layout shifts than most, frustrating users and leading to higher bounce rates.'
						) }
						positiveSubheading={ translate(
							'WordPress.com’s efficient content management ensures quicker load times and better engagement.'
						) }
						negativeSubheading={ translate(
							'WordPress.com’s efficient content management ensures quicker load times and better engagement.'
						) }
						url="https://wordpress.com/themes/"
						urlText={ translate( 'Load faster with us' ) }
					/>
				</div>
			</Container>
		);
	}
);
