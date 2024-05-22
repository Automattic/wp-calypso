import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { ForwardedRef, forwardRef } from 'react';
import {
	BASIC_METRICS_UNITS,
	BASIC_METRICS_NAMES,
	SCORES,
} from 'calypso/data/site-profiler/metrics-dictionaries';
import { calculateMetricsSectionScrollOffset } from 'calypso/site-profiler/utils/calculate-metrics-section-scroll-offset';
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
			return 'checkmark';
		case SCORES.poor:
			return 'info-outline';
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
			<Container className="basic-metrics" ref={ ref }>
				<div className="basic-metric-details result-list">
					{ ( Object.entries( basicMetrics ) as BasicMetricsScoredList ).map( ( metric ) => {
						const [ key, metricScored ] = metric;
						const showMetric = metricScored.value !== undefined && metricScored.value !== null;
						const displayValue = `${ metricScored.value }${ BASIC_METRICS_UNITS[ key ] }`;

						return (
							showMetric && (
								<div className="basic-metrics__card" key={ key }>
									<div className={ classNames( 'basic-metrics__header', metricScored.score ) }>
										<div className="basic-metrics__name">
											<Gridicon size={ 18 } icon={ getIcon( metricScored.score ) } />
											{ BASIC_METRICS_NAMES[ key ] }
										</div>
										<div className="basic-metrics__value">{ displayValue }</div>
									</div>
								</div>
							)
						);
					} ) }
				</div>
			</Container>
		);
	}
);
