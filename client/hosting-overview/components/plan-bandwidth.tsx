import { convertBytes } from 'calypso/my-sites/backup/backup-contents-page/file-browser/util';
import { useSiteMetricsQuery } from 'calypso/my-sites/site-monitoring/use-metrics-query';

interface PlanBandwidthProps {
	siteId: number;
}

const get30DaysRange = () => {
	const now = new Date();

	const today = new Date();
	const end = Math.floor( today.getTime() / 1000 );

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate( now.getDate() - 30 );
	const start = Math.floor( thirtyDaysAgo.getTime() / 1000 );

	return {
		start,
		end,
	};
};

export function PlanBandwidth( { siteId }: PlanBandwidthProps ) {
	const { start, end } = get30DaysRange();

	const { data } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: 'response_bytes_persec',
		summarize: true,
	} );

	if ( ! data ) {
		return;
	}

	const valueInBytes = data.data.periods.reduce(
		( acc, curr ) => acc + ( curr.dimension[ 'nightnei-test-gw-transfer-1.blog' ] || 0 ),
		0
	);
	const { unitAmount, unit } = convertBytes( valueInBytes );

	const startFormatted = new Date( start * 1000 ).toLocaleDateString();
	const endFormatted = new Date( end * 1000 ).toLocaleDateString();

	return (
		<div>
			<div
				style={ {
					display: 'flex',
					justifyContent: 'space-between',
					padding: '20px 0',
				} }
			>
				<div>Unlimited Bandwidth</div>
				<div title={ 'From ' + startFormatted + ' to ' + endFormatted }>
					{ unitAmount } { unit } used this month
				</div>
			</div>
			Go to Stats page
		</div>
	);
}
