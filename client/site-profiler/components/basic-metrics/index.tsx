import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { ForwardedRef, forwardRef } from 'react';
import { BASIC_METRICS_UNITS, SCORES } from 'calypso/data/site-profiler/metrics-dictionaries';
import { calculateMetricsSectionScrollOffset } from 'calypso/site-profiler/utils/calculate-metrics-section-scroll-offset';
import { BasicMetricsCard } from './basic-metrics-card';
import type {
	BasicMetricsScored,
	BasicMetricsScoredList,
	Scores,
} from 'calypso/data/site-profiler/types';
import './styles.scss';

const Container = styled.div`
	scroll-margin-top: ${ calculateMetricsSectionScrollOffset }px;
`;

function getIcon( score: Scores ) {
	switch ( score ) {
		case SCORES.good:
			return 'thumbs-up';
		case SCORES.poor:
			return 'notice';
		default:
			return 'info-outline';
	}
}

export const BasicMetrics = forwardRef(
	(
		{ basicMetrics }: { basicMetrics: BasicMetricsScored },
		ref: ForwardedRef< HTMLObjectElement >
	) => {
		return (
			<>
				<BasicMetricsCard />
				<Container className="basic-metrics" ref={ ref }>
					<h3>{ translate( 'Basic Performance Metrics' ) }</h3>
					<ul className="basic-metric-details result-list">
						{ ( Object.entries( basicMetrics ) as BasicMetricsScoredList ).map( ( metric ) => {
							const [ key, metricScored ] = metric;
							const showMetric = metricScored.value !== undefined && metricScored.value !== null;

							return (
								showMetric && (
									<li key={ key }>
										<div className="name">
											<a href={ `https://web.dev/articles/${ key }` }>{ key }</a>
										</div>
										<div className="basic-metrics__values">{ metricScored.value }</div>
										<div className="basic-metrics__unit">{ BASIC_METRICS_UNITS[ key ] }</div>
										<div className={ metricScored.score }>
											<Gridicon icon={ getIcon( metricScored.score ) } />
										</div>
									</li>
								)
							);
						} ) }
					</ul>
				</Container>
			</>
		);
	}
);
