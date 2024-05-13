import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { ForwardedRef, forwardRef } from 'react';
import { BASIC_METRICS_UNITS } from 'calypso/data/site-profiler/metrics-dictionaries';
import { calculateMetricsSectionScrollOffset } from 'calypso/site-profiler/utils/calculate-metrics-section-scroll-offset';
import type { BasicMetrics as BasicMetricsType } from 'calypso/data/site-profiler/types';

const Container = styled.div`
	scroll-margin-top: ${ calculateMetricsSectionScrollOffset }px;
`;

export const BasicMetrics = forwardRef(
	(
		{ basicMetrics }: { basicMetrics: BasicMetricsType },
		ref: ForwardedRef< HTMLObjectElement >
	) => {
		return (
			<Container className="basic-metrics" ref={ ref }>
				<h3>{ translate( 'Basic Performance Metrics' ) }</h3>
				<ul className="basic-metric-details result-list">
					{ Object.entries( basicMetrics ).map( ( [ key, value ] ) => {
						return (
							<li key={ key }>
								<div className="name">
									<a href={ `https://web.dev/articles/${ key }` }>{ key }</a>
								</div>
								<div>
									{ value } { BASIC_METRICS_UNITS[ key ] }
								</div>
							</li>
						);
					} ) }
				</ul>
			</Container>
		);
	}
);
