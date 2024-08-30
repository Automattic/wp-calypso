import clsx from 'clsx';
import { useRef, useState } from 'react';
import { Card } from '../';
import Popover from '../popover';
import { formatNumber } from './lib/numbers';

interface CountCardProps {
	heading?: React.ReactNode;
	icon?: JSX.Element;
	note?: string;
	showValueTooltip?: boolean;
	value: number | string | null;
}

function TooltipContent( { value, icon, heading }: CountCardProps ) {
	return (
		<div className="highlight-card-tooltip-content">
			{ ( icon || heading ) && (
				<span className="highlight-card-tooltip-label">
					{ icon && <span className="highlight-card-tooltip-icon">{ icon }</span> }
					{ heading && <span className="highlight-card-tooltip-heading">{ heading }</span> }
				</span>
			) }
			<span className="highlight-card-tooltip-counts">
				{ typeof value === 'number' ? formatNumber( value, false ) : value }
			</span>
		</div>
	);
}

export default function CountCard( {
	heading,
	icon,
	note,
	value,
	showValueTooltip,
}: CountCardProps ) {
	const textRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );

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
			{ showValueTooltip && (
				<Popover
					className="tooltip tooltip--darker highlight-card-tooltip"
					isVisible={ isTooltipVisible }
					position="bottom right"
					context={ textRef.current }
				>
					<TooltipContent heading={ heading } icon={ icon } value={ value } />
					{ note && <div className="highlight-card-tooltip-note">{ note }</div> }
				</Popover>
			) }
		</Card>
	);
}
