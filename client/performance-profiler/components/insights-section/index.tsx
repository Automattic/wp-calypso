import { useTranslate } from 'i18n-calypso';
import { ForwardedRef, forwardRef, useState } from 'react';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { MetricsInsight } from 'calypso/performance-profiler/components/metrics-insight';
import './style.scss';
import { metricsNames } from 'calypso/performance-profiler/utils/metrics';
type InsightsSectionProps = {
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	url: string;
	isWpcom: boolean;
	hash: string;
};

export const InsightsSection = forwardRef(
	( props: InsightsSectionProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const translate = useTranslate();
		const { audits, isWpcom, hash } = props;
		const [ selectedFilter, setSelectedFilter ] = useState( 'all' );
		const filteredAudits = Object.keys( audits ).filter(
			( key ) =>
				selectedFilter === 'all' ||
				audits[ key ].metricSavings?.hasOwnProperty( selectedFilter.toUpperCase() )
		);

		return (
			<div className="performance-profiler-insights-section" ref={ ref }>
				<div className="header">
					<div>
						<h2 className="title">{ translate( "Improve your site's performance" ) }</h2>
						<p className="subtitle">
							{ filteredAudits.length
								? translate( 'We found things you can do to speed up your site.' )
								: translate(
										"Great job! We didn't find any recommendations for improving the speed of your site."
								  ) }
						</p>
					</div>
					<div className="filter">
						<select
							value={ selectedFilter }
							onChange={ ( e ) => setSelectedFilter( e.target.value ) }
						>
							<option value="all">{ translate( 'All recommendations' ) } </option>
							{ Object.keys( metricsNames ).map( ( key ) => (
								<option value={ key } key={ 'option-' + key }>
									{ metricsNames[ key as keyof typeof metricsNames ]?.name }
								</option>
							) ) }
						</select>
					</div>
				</div>
				{ filteredAudits.map( ( key, index ) => (
					<MetricsInsight
						key={ `insight-${ index }` }
						insight={ { ...audits[ key ], id: key } }
						index={ index }
						url={ props.url }
						isWpcom={ isWpcom }
						hash={ hash }
					/>
				) ) }
			</div>
		);
	}
);
