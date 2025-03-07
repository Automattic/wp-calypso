import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { HTTPCodeSerie } from '../site-monitoring';
import { UplotTooltipProps } from './uplot-tooltip-plugin';

const PopoverStyled = styled.div( {
	transform: 'translate(-50%, -100% )',
} );
const PopoverInner = styled.div( {
	whiteSpace: 'nowrap',
	padding: '16px 14px',
	textAlign: 'left',
} );
const Serie = styled.div( {
	display: 'flex',
	alignItems: 'center',
	fontSize: 14,
	marginBottom: 4,
} );
const Dot = styled.div( ( props ) => ( {
	marginRight: 4,
	borderRadius: 4,
	width: 12,
	height: 3,
	backgroundColor: props.color,
} ) );
const Label = styled.div( {
	fontWeight: 'bold',
	marginRight: 4,
	marginLeft: 2,
} );
const Footer = styled.div( {
	color: 'var(--studio-gray-50)',
	textAlign: 'left',
	marginTop: 8,
	fontSize: 12,
	span: {
		fontWeight: 'bold',
	},
} );

interface seriesInfo {
	color: string;
	label: string;
	value: string | number;
}

interface LineChartTooltipProps {
	tooltipSeries: seriesInfo[];
	footer?: React.ReactNode;
}

function rountToTwoDecimals( value: number ) {
	return Math.round( value * 100 ) / 100;
}

export function LineChartTooltip( { tooltipSeries, footer }: LineChartTooltipProps ) {
	return (
		<PopoverStyled role="tooltip" className="popover is-top">
			<div className="popover__arrow"></div>
			<PopoverInner className="popover__inner">
				{ tooltipSeries.map( ( { color, label, value } ) => (
					<Serie key={ label }>
						<Dot color={ color } /> <Label>{ label }:</Label> { value }
					</Serie>
				) ) }
				{ footer && <Footer>{ footer }</Footer> }
			</PopoverInner>
		</PopoverStyled>
	);
}

export function FirstChartTooltip( { data, idx, ...rest }: UplotTooltipProps ) {
	const dateString = moment( data[ 0 ][ idx ] * 1000 ).format( 'HH:mm DD MMMM' );
	return (
		<LineChartTooltip
			{ ...rest }
			tooltipSeries={ [
				{
					color: 'var(--studio-blue-50)',
					label: translate( 'Requests per minute' ),
					value: rountToTwoDecimals( data[ 1 ][ idx ] ),
				},
				{
					color: 'rgba(222, 177, 0, 1)',
					label: translate( 'Average response time' ),
					value: `${ rountToTwoDecimals( data[ 2 ][ idx ] ) }ms`,
				},
			] }
			footer={ dateString }
		/>
	);
}

interface HttpChartTooltipProps extends UplotTooltipProps {
	series: HTTPCodeSerie[];
}

export function HttpChartTooltip( { data, idx, series = [], ...rest }: HttpChartTooltipProps ) {
	const [ timestamps, ...requests ] = data;
	const dateString = moment( timestamps[ idx ] * 1000 ).format( 'HH:mm DD MMMM' );
	const totalRequests = rountToTwoDecimals(
		requests.reduce( ( acc, serie ) => acc + rountToTwoDecimals( serie[ idx ] ), 0 )
	);
	/* translators: the totalRequests is a number of requests */
	const totalRequestsString = translate( '%(totalRequests)s requests', {
		args: {
			totalRequests,
		},
	} );
	const filteredTooltipSeries = series
		.map( ( serie, serieI ) => ( {
			color: serie.stroke,
			label: serie.label,
			value: rountToTwoDecimals( data[ serieI + 1 ][ idx ] ),
			showInTooltip: serie.showInTooltip,
		} ) )
		.filter( ( serie ) => {
			return !! serie.showInTooltip || serie.value > 0;
		} );
	return (
		<LineChartTooltip
			{ ...rest }
			tooltipSeries={ filteredTooltipSeries }
			footer={ `${ totalRequestsString } - ${ dateString }` }
		/>
	);
}

export function withSeries(
	Component: React.ComponentType< HttpChartTooltipProps >,
	series: HTTPCodeSerie[]
) {
	return ( props: UplotTooltipProps ) => <Component { ...props } series={ series } />;
}
