import type { SiteUptime } from '../data/site-jetpack-monitor-uptime';

export function getSiteUptime( uptimes?: Record< string, SiteUptime > ) {
	if ( ! uptimes ) {
		return null;
	}

	const { upDays, downDays } = Object.entries( uptimes ).reduce(
		( accumulator, [ , { status } = {} ] ) => {
			if ( status === 'monitor_inactive' ) {
				return accumulator;
			}

			accumulator[ status === 'up' ? 'upDays' : 'downDays' ] += 1;
			return accumulator;
		},
		{ upDays: 0, downDays: 0 }
	);

	if ( ! upDays && ! downDays ) {
		return null;
	}

	const summaryUptime = Math.round( ( ( upDays / ( upDays + downDays ) ) * 1000 ) / 10 );

	return {
		value: summaryUptime,
		label: `${ summaryUptime }%`,
	};
}
