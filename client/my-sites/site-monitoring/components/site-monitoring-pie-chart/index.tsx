import classnames from 'classnames';
import PieChart from 'calypso/components/pie-chart';
import PieChartLegend from 'calypso/components/pie-chart/legend';

import './style.scss';

type Props = {
	title: string;
	className?: string;
	data: Array< { name: string; value: number; description: string | undefined } >;
};

export const SiteMonitoringPieChart = ( { title, className, data }: Props ) => {
	const classes = [ 'site-monitoring-pie-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}
	return (
		<div className={ classnames( classes ) }>
			<header className="site-monitoring__chart-header">
				<h2 className="site-monitoring__chart-title">{ title }</h2>
			</header>
			<PieChart data={ data } />
			<PieChartLegend data={ data } />
		</div>
	);
};
