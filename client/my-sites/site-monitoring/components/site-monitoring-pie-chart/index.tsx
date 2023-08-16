import { Spinner } from '@wordpress/components';
import classnames from 'classnames';
import PieChart from 'calypso/components/pie-chart';
import PieChartLegend from 'calypso/components/pie-chart/legend';

import './style.scss';

type Props = {
	title: string;
	subtitle?: string | React.ReactNode;
	className?: string;
	data: Array< { name: string; value: number; description: string | undefined } >;
	regularOrder?: boolean;
};

export const SiteMonitoringPieChart = ( {
	title,
	subtitle,
	className,
	data,
	regularOrder,
}: Props ) => {
	const classes = [ 'site-monitoring-pie-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}

	return (
		<div className={ classnames( classes ) }>
			<header className="site-monitoring__chart-header">
				<h2 className="site-monitoring__chart-title">{ title }</h2>
				{ subtitle && <p className="site-monitoring__chart-subtitle">{ subtitle }</p> }
			</header>
			<div className="site-monitoring__chart-container">
				{ ! data.length ? <Spinner /> : null }
				<PieChart data={ data } donut startAngle={ 0 } />
			</div>
			<PieChartLegend data={ data } onlyPercent regularOrder={ regularOrder } />
		</div>
	);
};
