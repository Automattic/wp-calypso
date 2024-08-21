import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { Metrics, PerformanceMetricsHistory } from 'calypso/data/site-profiler/types';
import { useSupportChatLLMQuery } from 'calypso/performance-profiler/hooks/use-support-chat-llm-query';
import {
	metricsNames,
	metricsTresholds,
	mapThresholdsToStatus,
	metricValuations,
} from 'calypso/performance-profiler/utils/metrics';
import HistoryChart from '../charts/history-chart';
import { MetricScale } from '../metric-scale';
import { MetricTabBar } from '../metric-tab-bar';
import { StatusIndicator } from '../status-indicator';
import './style.scss';

type CoreWebVitalsDisplayProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
};

export const CoreWebVitalsDisplay = ( props: CoreWebVitalsDisplayProps ) => {
	const translate = useTranslate();
	const [ activeTab, setActiveTab ] = useState< Metrics >( 'fcp' );

	const { displayName } = metricsNames[ activeTab as keyof typeof metricsNames ];
	const value = props[ activeTab ];
	const valuation = mapThresholdsToStatus( activeTab as keyof typeof metricsTresholds, value );

	const { good, needsImprovement } = metricsTresholds[ activeTab as keyof typeof metricsTresholds ];
	const formatUnit = ( value: number ) => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return +( value / 1000 ).toFixed( 2 );
		}

		return value;
	};

	const displayUnit = () => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return translate( 's', { comment: 'Used for displaying a time range in seconds, eg. 1-2s' } );
		}

		if ( [ 'inp' ].includes( activeTab ) ) {
			return translate( 'ms', {
				comment: 'Used for displaying a range in milliseconds, eg. 100-200ms',
			} );
		}

		return '';
	};

	const { history } = props;
	let metrics: number[] = history?.metrics[ activeTab ] ?? [];
	let dates = history?.collection_period ?? [];

	// last 8 weeks only
	metrics = metrics.slice( -8 );
	dates = dates.slice( -8 );

	// the comparison is inverse here because the last value is the most recent
	const positiveTendency = metrics[ metrics.length - 1 ] < metrics[ 0 ];

	const dataAvailable = metrics.length > 0 && metrics.some( ( item ) => item !== null );
	const historicalData = metrics.map( ( item, index ) => {
		return {
			date: dates[ index ],
			value: formatUnit( item ),
		};
	} );

	const [ retrieveInsight, setRetrieveInsight ] = useState( false );
	const { data: llmAnswer, isLoading: isLoadingLlmAnswer } = useSupportChatLLMQuery(
		`${ metricsNames[ activeTab ].name }: ${ formatUnit( value ) }`,
		retrieveInsight
	);

	return (
		<div className="core-web-vitals-display">
			<MetricTabBar activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props } />
			<div className="core-web-vitals-display__details">
				<div className="core-web-vitals-display__description">
					<span className="core-web-vitals-display__description-subheading">
						{ metricValuations[ activeTab ][ valuation ] }
					</span>
					<MetricScale metricName={ activeTab } value={ value } valuation={ valuation } />
					<div className="core-web-vitals-display__ranges">
						<div className="range">
							<StatusIndicator speed="good" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Fast' ) }</div>
								<div className="range-subheading">
									{ translate( '0–%(to)s%(unit)s', {
										args: { to: formatUnit( good ), unit: displayUnit() },
										comment: 'Displaying a time range, eg. 0-1s',
									} ) }
								</div>
							</div>
						</div>
						<div className="range">
							<StatusIndicator speed="needsImprovement" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Moderate' ) }</div>
								<div className="range-subheading">
									{ translate( '%(from)s–%(to)s%(unit)s', {
										args: {
											from: formatUnit( good ),
											to: formatUnit( needsImprovement ),
											unit: displayUnit(),
										},
										comment: 'Displaying a time range, eg. 2-3s',
									} ) }
								</div>
							</div>
						</div>
						<div className="range">
							<StatusIndicator speed="bad" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Slow' ) }</div>
								<div className="range-subheading">
									{ translate( '>%(from)s%(unit)s', {
										args: {
											from: formatUnit( needsImprovement ),
											unit: displayUnit(),
										},
										comment: 'Displaying a time range, eg. >2s',
									} ) }
								</div>
							</div>
						</div>
					</div>
					<span className="core-web-vitals-display__description-subheading">
						{ metricValuations[ activeTab ].heading }&nbsp;
					</span>
					<span className="core-web-vitals-display__description-aka">
						{ metricValuations[ activeTab ].aka }
					</span>
					<p>{ metricValuations[ activeTab ].explanation }</p>
					<div>
						{ ! retrieveInsight && (
							<Button variant="link" onClick={ () => setRetrieveInsight( true ) }>
								{ translate( 'Explain my score' ) }
							</Button>
						) }
						<Markdown
							components={ {
								a( props: any ) {
									return <a target="_blank" { ...props } />;
								},
							} }
						>
							{ isLoadingLlmAnswer ? 'Loading explanation...' : llmAnswer }
						</Markdown>
					</div>
				</div>
				<div className="core-web-vitals-display__history-graph">
					{ dataAvailable && (
						<span className="core-web-vitals-display__description-subheading">
							{ positiveTendency
								? translate( '%s has improved over the past eight weeks', {
										args: [ displayName ],
								  } )
								: translate( '%s has declined over the past eight weeks', {
										args: [ displayName ],
								  } ) }
						</span>
					) }
					<HistoryChart
						data={ dataAvailable && historicalData }
						range={ [
							formatUnit( metricsTresholds[ activeTab ].good ),
							formatUnit( metricsTresholds[ activeTab ].needsImprovement ),
						] }
						width={ 550 }
						height={ 300 }
					/>
				</div>
			</div>
		</div>
	);
};
