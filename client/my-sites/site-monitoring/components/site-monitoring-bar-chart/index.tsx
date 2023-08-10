import UplotBarChart, { UplotChartProps } from '@automattic/components/src/chart-uplot/bar';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { LegendTooltip } from './legend-tooltip';

interface Props extends Pick< UplotChartProps, 'data' | 'labels' > {
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
	const legendData = [
		// 200
		{
			fillColor: '#68B3E8',
			tooltip: (
				<LegendTooltip title={ translate( 'OK Response' ) }>
					{ translate( 'The client request was successfully received, understood, and accepted.' ) }
				</LegendTooltip>
			),
		},
		// 401
		{
			fillColor: '#A7AAAD',
			tooltip: (
				<LegendTooltip title={ translate( 'Unauthorized Response' ) }>
					{ translate(
						'The client request was not completed because it lacked valid authentication credentials for the requested resource.'
					) }
				</LegendTooltip>
			),
		},
		// 400
		{
			fillColor: '#F2D76B',
			tooltip: (
				<LegendTooltip title={ translate( 'Bad Request Response' ) }>
					{ translate(
						"The client request was malformed or couldn't be understood by the server."
					) }
				</LegendTooltip>
			),
		},
		// 404
		{
			fillColor: '#09B585',
			tooltip: (
				<LegendTooltip title={ translate( 'Not Found Response' ) }>
					{ translate(
						"The server couldn't find the requested resource. The resource was either removed or not available with the given URL."
					) }
				</LegendTooltip>
			),
		},
		// 500
		{
			fillColor: '#F283AA',
			tooltip: (
				<LegendTooltip title={ translate( 'Internal Server Error Response' ) }>
					{ translate(
						'The server encountered an unexpected error which prevented it from completing the client request.'
					) }
				</LegendTooltip>
			),
		},
	];
	return (
		<div className={ classnames( classes ) }>
			<header className="site-monitoring__chart-header">
				<h2 className="site-monitoring__chart-title">{ title }</h2>
				{ tooltip && (
					<InfoPopover className="site-monitoring__chart-tooltip">{ tooltip }</InfoPopover>
				) }
			</header>
			{ isValidData && <UplotBarChart { ...rest } legendData={ legendData } /> }
		</div>
	);
};
