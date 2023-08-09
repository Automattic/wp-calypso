import UplotBarChart, { UplotChartProps } from '@automattic/components/src/chart-uplot/bar';
import classnames from 'classnames';
import InfoPopover from 'calypso/components/info-popover';

interface Props extends UplotChartProps {
	title: string;
	tooltip?: string | React.ReactNode;
	className?: string;
}

export const SiteMonitoringBarChart = ( { title, tooltip, className, ...rest }: Props ) => {
	const classes = [ 'site-monitoring-bar-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}
	const isValidData = rest.data?.[ 0 ]?.length > 0;
	return (
		<div className={ classnames( classes ) }>
			<header className="site-monitoring__chart-header">
				<h2 className="site-monitoring__chart-title">{ title }</h2>
				{ tooltip && (
					<InfoPopover className="site-monitoring__chart-tooltip">{ tooltip }</InfoPopover>
				) }
			</header>
			{ isValidData && <UplotBarChart { ...rest } /> }
		</div>
	);
};
