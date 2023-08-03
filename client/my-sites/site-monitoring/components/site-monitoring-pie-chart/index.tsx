import PieChart from 'calypso/components/pie-chart';

import './style.scss';

type Props = {
	title: string;
	data: Array< { name: string; value: number; description: string | undefined } >;
};

export const SiteMonitoringPieChart = ( { title, data }: Props ) => {
	return (
		<div className="site-monitoring-pie-chart">
			<h2 className="site-monitoring-pie-chart__title">{ title }</h2>
			<PieChart data={ data } legend={ false } tooltip={ false } />
		</div>
	);
};
