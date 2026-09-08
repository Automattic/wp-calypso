import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useRef, FunctionComponent } from 'react';
import Chart from 'calypso/components/chart';
import Legend from 'calypso/components/chart/legend';
import { rectIsEqual, rectIsZero, NullableDOMRect } from 'calypso/lib/track-element-size';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import StatsEmptyState from 'calypso/my-sites/stats/stats-empty-state';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { getChartRangeParams } from 'calypso/my-sites/stats/utils';
import nothing from '../components/nothing';
import useVisitsQuery from '../hooks/use-visits-query';
import { DateRange } from '../lib/date-ranges';

import './mini-chart.scss';

interface MiniChartProps {
	siteId: number;
	gmtOffset: number;
	statsBaseUrl: string;
	range: DateRange;
}

interface BarData {
	period: string;
	value: number;
}

const MiniChart: FunctionComponent< MiniChartProps > = ( {
	siteId,
	gmtOffset,
	statsBaseUrl,
	range,
} ) => {
	const translate = useTranslate();
	const { unit, quantity } = range;

	const chartViews = {
		attr: 'views',
		legendOptions: [ 'visitors' ],
		label: translate( 'Views', { context: 'noun' } ),
	};
	const chartVisitors = {
		attr: 'visitors',
		label: translate( 'Visitors', { context: 'noun' } ),
	};
	const charts = [ chartViews, chartVisitors ];

	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );

	const { isLoading, data } = useVisitsQuery( siteId, unit, quantity, queryDate );

	const barClick = ( bar: { data: BarData } ) => {
		const { chartStart, chartEnd, chartPeriod } = getChartRangeParams( bar.data.period, unit );

		window.location.href = `${ statsBaseUrl }/stats/${ chartPeriod }/${ siteId }?chartStart=${ chartStart }&chartEnd=${ chartEnd }`;
	};

	const chartData = buildChartData(
		chartViews.legendOptions,
		chartViews.attr,
		data,
		unit,
		queryDate
	);

	const chartWrapperRef = useRef< HTMLDivElement >( null );
	const lastRect = useRef< NullableDOMRect >( null );
	useEffect( () => {
		if ( ! chartWrapperRef?.current ) {
			return;
		}
		const observer = new ResizeObserver( () => {
			const rect = chartWrapperRef.current ? chartWrapperRef.current.getBoundingClientRect() : null;
			if ( ! rectIsEqual( lastRect.current, rect ) && ! rectIsZero( rect ) ) {
				lastRect.current = rect;
				// Trigger a resize event to force the chart to redraw.
				window?.dispatchEvent( new Event( 'resize' ) );
			}
		} );

		observer.observe( chartWrapperRef.current );

		return () => observer.disconnect();
	} );

	const isEmptyChart = ! chartData.some( ( bar: BarData ) => bar.value > 0 );
	const placeholderChartData = Array.from( { length: quantity }, () => ( {
		value: Math.random(),
	} ) );

	return (
		<div
			ref={ chartWrapperRef }
			id="stats-widget-minichart"
			className="stats-widget-minichart"
			aria-hidden="true"
		>
			{ isLoading && <StatsModulePlaceholder className="is-chart" isLoading /> }
			{ ! isLoading && (
				<>
					<Chart
						barClick={ barClick }
						data={ isEmptyChart ? placeholderChartData : chartData }
						minBarWidth={ 35 }
						isPlaceholder={ isEmptyChart }
					>
						<StatsEmptyState
							headingText=""
							infoText={ translate(
								'Once stats become available, this chart will show you details about your views and visitors. {{a}}Learn more about stats{{/a}}',
								{
									components: {
										a: (
											<a
												href="https://jetpack.com/stats/"
												target="_blank"
												rel="noopener noreferrer"
											></a>
										),
									},
								}
							) }
						/>
					</Chart>
					<Legend
						availableCharts={ [ 'visitors' ] }
						activeCharts={ [ 'visitors' ] }
						tabs={ charts }
						activeTab={ chartViews }
						clickHandler={ nothing }
					/>
				</>
			) }
		</div>
	);
};

export default MiniChart;
