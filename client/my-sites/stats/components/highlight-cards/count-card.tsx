import { Card, Popover } from '@automattic/components';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { formatNumber } from './lib/numbers';
import TooltipContent from './tooltip-content';

interface CountCardProps {
	heading?: React.ReactNode;
	icon?: JSX.Element;
	label?: string;
	note?: string;
	showValueTooltip?: boolean;
	value: number | null;
	previousValue?: number | null;
}

export default function CountCard( {
	heading,
	icon,
	label,
	note,
	value,
	showValueTooltip,
}: CountCardProps ) {
	const textRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );

	// Tooltips are used to show the full number instead of the shortened number.
	// Non-numeric values are not shown in the tooltip.
	const shouldShowTooltip = showValueTooltip && typeof value === 'number';

	return (
		<Card className="highlight-card">
			{ icon && <div className="highlight-card-icon">{ icon }</div> }
			{ heading && <div className="highlight-card-heading">{ heading }</div> }
			<div
				className={ clsx( 'highlight-card-count', {
					'is-pointer': showValueTooltip,
				} ) }
				onMouseEnter={ () => setTooltipVisible( true ) }
				onMouseLeave={ () => setTooltipVisible( false ) }
			>
				<span className="highlight-card-count-value" ref={ textRef }>
					{ typeof value === 'number' ? formatNumber( value, true ) : value }
				</span>
			</div>
			{ shouldShowTooltip && (
				<Popover
					className="tooltip tooltip--darker highlight-card-tooltip"
					isVisible={ isTooltipVisible }
					position="bottom right"
					context={ textRef.current }
				>
					<TooltipContent value={ value } label={ label } note={ note } />
				</Popover>
			) }
		</Card>
	);
}
