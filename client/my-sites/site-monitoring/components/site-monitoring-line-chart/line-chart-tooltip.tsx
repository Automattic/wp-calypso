import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { UplotTooltipProps } from './uplot-tooltip-plugin';

const Root = styled.div( {
	minWidth: 300,
	transform: 'translate(-50%, -100%)',
	padding: '8px 12px',
	marginBottom: 8,
} );
const Serie = styled.div( {
	display: 'flex',
	alignItems: 'center',
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
} );
const Footer = styled.div( {
	color: 'var(--studio-gray-50)',
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

export function LineChartTooltip( { tooltipSeries, footer }: LineChartTooltipProps ) {
	return (
		<Root>
			{ tooltipSeries.map( ( { color, label, value } ) => (
				<div key={ label }>
					<Serie>
						<Dot color={ color } /> <Label>{ label }</Label>: { value }
					</Serie>
				</div>
			) ) }
			{ footer && <Footer>{ footer }</Footer> }
		</Root>
	);
}

export function FirstChartTooltip( { data, idx }: UplotTooltipProps ) {
	return (
		<LineChartTooltip
			tooltipSeries={ [
				{
					color: 'var(--studio-blue-50)',
					label: translate( 'Requests per minute' ),
					value: Math.floor( data[ 1 ][ idx ] ),
				},
				{
					color: 'rgba(222, 177, 0, 1)',
					label: translate( 'Average response time' ),
					value: `${ Math.floor( data[ 2 ][ idx ] ) }ms`,
				},
			] }
			footer={ moment( data[ 0 ][ idx ] * 1000 ).format( 'HH:mm DD MMMM' ) }
		/>
	);
}
