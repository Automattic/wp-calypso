import { Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import PieChart from 'calypso/components/pie-chart';
import PieChartLegend from 'calypso/components/pie-chart/legend';

import './style.scss';

type Props = {
	title: string;
	subtitle: string;
	className?: string;
	data: Array< {
		name: string;
		value: number;
		description: string | undefined;
		className: string;
	} >;
	fixedOrder?: boolean;
};

export const SiteMonitoringPieChart = ( {
	title,
	subtitle,
	className,
	data,
	fixedOrder,
}: Props ) => {
	const classes = [ 'site-monitoring-pie-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}

	return (
		<HostingCard className={ clsx( classes ) } title={ title }>
			<HostingCardDescription>{ subtitle }</HostingCardDescription>
			<div className="site-monitoring__chart-container">
				{ ! data.length ? <Spinner /> : null }
				<PieChart data={ data } donut startAngle={ 0 } />
			</div>
			<PieChartLegend data={ data } onlyPercent fixedOrder={ fixedOrder } />
		</HostingCard>
	);
};
