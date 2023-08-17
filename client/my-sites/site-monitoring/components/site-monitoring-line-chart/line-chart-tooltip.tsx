import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import moment from 'moment';
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
} );
const Footer = styled.div( {
	color: 'var(--studio-gray-50)',
	textAlign: 'left',
	marginTop: 8,
	fontSize: 12,
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
		<PopoverStyled role="tooltip" className="popover is-top">
			<div className="popover__arrow"></div>
			<PopoverInner className="popover__inner">
				{ tooltipSeries.map( ( { color, label, value } ) => (
					<Serie key={ label }>
						<Dot color={ color } /> <Label>{ label }</Label>: { value }
					</Serie>
				) ) }
				{ footer && <Footer>{ footer }</Footer> }
			</PopoverInner>
		</PopoverStyled>
	);
}

export function FirstChartTooltip( { data, idx, ...rest }: UplotTooltipProps ) {
	return (
		<LineChartTooltip
			{ ...rest }
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
