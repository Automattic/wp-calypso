import { translate } from 'i18n-calypso';
import { BASIC_METRICS_UNITS } from 'calypso/data/site-profiler/metrics-dictionaries';
import type { BasicMetrics } from 'calypso/data/site-profiler/types';

export function BasicMetrics( { basicMetrics }: { basicMetrics: BasicMetrics } ) {
	return (
		<div className="basic-metrics">
			<h3>{ translate( 'Basic Performance Metrics' ) }</h3>
			<ul className="basic-metric-details result-list">
				{ Object.entries( basicMetrics ).map( ( [ key, value ] ) => {
					return (
						<li>
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
		</div>
	);
}
