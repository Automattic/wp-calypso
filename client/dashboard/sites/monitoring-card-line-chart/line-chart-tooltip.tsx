import styled from '@emotion/styled';
import { UplotTooltipProps, seriesInfo } from './uplot-tooltip-plugin';

export interface HTTPCodeSerie {
	statusCode: number;
	fill: string;
	label: string;
	stroke: string;
	showInLegend?: boolean;
	showInTooltip?: boolean;
}

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

interface LineChartTooltipProps {
	tooltipSeries: seriesInfo[];
	footer?: React.ReactNode;
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

export function FirstChartTooltipWithSeriesHandler(
	seriesHandler: ( i: number, value: number ) => seriesInfo | null
) {
	const TooltipComponent = ( { data, idx, ...rest }: UplotTooltipProps ) => {
		const dateString = new Date( data[ 0 ][ idx ] * 1000 ).toLocaleString( 'en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: 'long',
		} );

		const series: seriesInfo[] = [];
		for ( const i in data ) {
			const val = seriesHandler( parseInt( i ), data[ i ][ idx ] );
			if ( val !== null ) {
				series.push( val );
			}
		}

		return <LineChartTooltip { ...rest } tooltipSeries={ series } footer={ dateString } />;
	};

	TooltipComponent.displayName = 'TooltipComponent';
	return TooltipComponent;
}
