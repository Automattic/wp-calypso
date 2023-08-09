import { Spinner } from '@wordpress/components';
import classnames from 'classnames';
import InfoPopover from 'calypso/components/info-popover';
import PieChart from 'calypso/components/pie-chart';
import PieChartLegend from 'calypso/components/pie-chart/legend';

import './style.scss';

type Props = {
	title: string;
	tooltip?: string;
	className?: string;
	data: Array< { name: string; value: number; description: string | undefined } >;
};

export const SiteMonitoringPieChart = ( { title, tooltip, className, data }: Props ) => {
	const classes = [ 'site-monitoring-pie-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}

	return (
		<div className={ classnames( classes ) }>
			<header className="site-monitoring__chart-header">
				<h2 className="site-monitoring__chart-title">{ title }</h2>
				{ tooltip && (
					<InfoPopover className="site-monitoring__chart-tooltip">{ tooltip }</InfoPopover>
				) }
			</header>
			<div className="site-monitoring__chart-container">
				{ ! data.length ? <Spinner /> : null }
				<PieChart data={ data } donut />
			</div>
			<PieChartLegend data={ data } onlyPercent />
		</div>
	);
};
