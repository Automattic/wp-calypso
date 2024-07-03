import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import { calculateMetricsSectionScrollOffset } from 'calypso/site-profiler/utils/calculate-metrics-section-scroll-offset';
import { formatMsValue } from 'calypso/site-profiler/utils/format-ms-value';
import { CopiesReturnValueList, MetricsCopies, getCopies } from './copies';
import type { BasicMetricsScored, Metrics, Scores } from 'calypso/data/site-profiler/types';
import './styles.scss';

const Container = styled.div`
	scroll-margin-top: ${ calculateMetricsSectionScrollOffset }px;
	margin-bottom: 130px;
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
	copies: MetricsCopies;
};

export const BasicMetric = ( { metric, basicMetrics, name, copies }: BasicMetricProps ) => {
	const { value, score } = basicMetrics[ metric ];
	const showMetric = value !== undefined && value !== null;
	const isPositiveScore = score === 'good';

	return (
		showMetric && (
			<div className="basic-metrics__card">
				<div className={ clsx( 'basic-metrics__header', score ) }>
					<div className="basic-metrics__name">
						<Gridicon size={ 18 } icon={ getIcon( score ) } />
						{ name }
					</div>
					<div className="basic-metrics__value">
						{ metric === 'cls' ? value.toFixed( 2 ) : formatMsValue( value ) }
					</div>
				</div>
				<h3>{ isPositiveScore ? copies.good.diagnostic : copies.poor.diagnostic }</h3>
				<h4>{ isPositiveScore ? copies.good.solution : copies.poor.solution }</h4>
				<a href={ isPositiveScore ? copies.good.url : copies.poor.url }>
					{ isPositiveScore ? copies.good.cta : copies.poor.cta }
					<SubtitleIcon icon="chevron-right" size={ 18 } />
				</a>
			</div>
		)
	);
};

export const BasicMetrics = forwardRef(
	(
		{
			basicMetrics,
			domain,
			isWpCom,
		}: { basicMetrics: BasicMetricsScored; domain: string; isWpCom: boolean },
		ref: ForwardedRef< HTMLObjectElement >
	) => {
		const translate = useTranslate();

		const copies = useMemo(
			() => getCopies( basicMetrics, translate, domain ),
			[ basicMetrics, translate, domain ]
		);

		return (
			<Container className="basic-metrics" ref={ ref }>
				<div className="basic-metric-details result-list">
					{ ( Object.entries( copies ) as CopiesReturnValueList ).map(
						( [ metricKey, metricCopies ] ) => {
							return (
								<BasicMetric
									key={ metricKey }
									metric={ metricKey }
									basicMetrics={ basicMetrics }
									name={ metricCopies.title }
									copies={ isWpCom ? metricCopies.wpcom : metricCopies.nonWpcom }
								/>
							);
						}
					) }
				</div>
			</Container>
		);
	}
);
