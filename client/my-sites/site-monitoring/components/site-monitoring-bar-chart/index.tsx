import UplotBarChart, { UplotChartProps } from '@automattic/components/src/chart-uplot/bar';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { LegendTooltip } from './legend-tooltip';

interface Props extends Pick< UplotChartProps, 'data' | 'labels' | 'isLoading' > {
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
				<LegendTooltip title={ translate( 'OK' ) }>
					{ translate(
						'The HTTP 200 OK success status response code indicates that the request has succeeded.'
					) }
				</LegendTooltip>
			),
		},
		// 401
		{
			fillColor: '#A7AAAD',
			tooltip: (
				<LegendTooltip title={ translate( 'Unauthorized Response' ) }>
					{ translate(
						'The client request has not been completed because it lacks valid authentication credentials for the requested resource.'
					) }
				</LegendTooltip>
			),
		},
		// 400
		{
			fillColor: '#F2D76B',
			tooltip: (
				<LegendTooltip title={ translate( 'Bad Request' ) }>
					{ translate(
						'The server cannot or will not process the request due to something that is perceived to be a client error (for example, malformed request syntax, invalid request message framing, or deceptive request routing).'
					) }
				</LegendTooltip>
			),
		},
		// 404
		{
			fillColor: '#09B585',
			tooltip: (
				<LegendTooltip title={ translate( 'Not Found' ) }>
					{ translate(
						'The server cannot find the requested resource. Links that lead to a 404 page are often called broken or dead links.'
					) }
				</LegendTooltip>
			),
		},
		// 500
		{
			fillColor: '#F283AA',
			tooltip: (
				<LegendTooltip title={ translate( 'Internal Server Error' ) }>
					{ translate(
						'The server encountered an unexpected condition that prevented it from fulfilling the request.'
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
