import { useTranslate } from 'i18n-calypso';
import { ForwardedRef, forwardRef } from 'react';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { MetricsInsight } from 'calypso/performance-profiler/components/metrics-insight';
import './style.scss';

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

		return (
			<div className="performance-profiler-insights-section" ref={ ref }>
				<h2 className="title">{ translate( "Improve your site's performance" ) }</h2>
				<p className="subtitle">
					{ Object.keys( audits ).length
						? translate( 'We found things you can do to speed up your site.' )
						: translate(
								"Great job! We didn't find any recommendations for improving the speed of your site."
						  ) }
				</p>
				{ Object.keys( audits ).map( ( key, index ) => (
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
