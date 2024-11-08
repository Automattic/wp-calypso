import { clsx } from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Metrics } from 'calypso/data/site-profiler/types';
import { CircularPerformanceScore } from 'calypso/hosting/performance/components/circular-performance-score/circular-performance-score';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	metricsNames,
	mapThresholdsToStatus,
	displayValue,
} from 'calypso/performance-profiler/utils/metrics';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import { StatusIndicator } from '../status-indicator';
import './style.scss';

type Props = Record< Metrics, number > & {
	activeTab: Metrics;
	setActiveTab: ( tab: Metrics ) => void;
	showOverall?: boolean;
};

const MetricTabBar = ( props: Props ) => {
	const translate = useTranslate();
	const { activeTab, setActiveTab, showOverall } = props;

	const handleTabClick = ( tab: Metrics ) => {
		setActiveTab( tab );
		recordTracksEvent( 'calypso_performance_profiler_metric_tab_click', {
			tab,
			version: profilerVersion(),
		} );
	};

	return (
		<div className="metric-tab-bar">
			{ showOverall && (
				<button
					className={ clsx( 'metric-tab-bar__tab metric-tab-bar__performance', {
						active: activeTab === 'overall',
					} ) }
					onClick={ () => handleTabClick( 'overall' ) }
				>
					<div className="metric-tab-bar__tab-text">
						<div className="metric-tab-bar__tab-header">{ translate( 'Performance Score' ) }</div>
						<div className="metric-tab-bar__tab-metric">
							<CircularPerformanceScore score={ props.overall } size={ 48 } />
						</div>
					</div>
				</button>
			) }
			<div className="metric-tab-bar__tab-container">
				{ Object.entries( metricsNames ).map( ( [ key, { name: displayName } ] ) => {
					if ( props[ key as Metrics ] === undefined || props[ key as Metrics ] === null ) {
						return null;
					}

					// Only display TBT if INP is not available
					if ( key === 'tbt' && props[ 'inp' ] !== undefined && props[ 'inp' ] !== null ) {
						return null;
					}

					if ( key === 'overall' ) {
						return null;
					}

					const status = mapThresholdsToStatus( key as Metrics, props[ key as Metrics ] );
					const statusClassName = status === 'needsImprovement' ? 'needs-improvement' : status;

					return (
						<button
							key={ key }
							className={ clsx( 'metric-tab-bar__tab', { active: key === activeTab } ) }
							onClick={ () => handleTabClick( key as Metrics ) }
						>
							<div className="metric-tab-bar__tab-status">
								<StatusIndicator
									speed={ mapThresholdsToStatus( key as Metrics, props[ key as Metrics ] ) }
								/>
							</div>
							<div className="metric-tab-bar__tab-text">
								<div className="metric-tab-bar__tab-header">{ displayName }</div>
								<div className={ `metric-tab-bar__tab-metric ${ statusClassName }` }>
									{ displayValue( key as Metrics, props[ key as Metrics ] ) }
								</div>
							</div>
						</button>
					);
				} ) }
			</div>
		</div>
	);
};

export default MetricTabBar;
