import { formatNumber as formatNumberI18n } from '@automattic/number-formatters';
import { arrowDown, arrowUp, Icon } from '@wordpress/icons';
import { subtract } from './lib/numbers';

interface TooltipContentProps {
	label?: string;
	note?: string;
	value: number | null;
	previousValue?: number | null;
}

export default function TooltipContent( {
	value,
	label,
	note,
	previousValue,
}: TooltipContentProps ) {
	const difference = subtract( value, previousValue );

	let trendClass = 'highlight-card-tooltip-count-difference-positive';
	let trendIcon = arrowUp;
	if ( difference !== null && difference < 0 ) {
		trendClass = 'highlight-card-tooltip-count-difference-negative';
		trendIcon = arrowDown;
	}

	/**
	 * TODO clk - We are currently in the process of unifying numberFormat from i18n-calypso with the one from number-formatters.
	 * Once settled, we should consider where to place the "-" default for null values.
	 */
	const tooltipCount = value !== null ? formatNumberI18n( value ) : '—';

	return (
		<div className="highlight-card-tooltip-content">
			<span className="highlight-card-tooltip-counts">
				{ tooltipCount }
				{ label && ` ${ label }` }
			</span>
			{ difference !== null && difference !== 0 && (
				<span className={ trendClass }>
					<Icon size={ 18 } icon={ trendIcon } />
					{ formatNumberI18n( Math.abs( difference ) ) }
				</span>
			) }
			{ note && <div className="highlight-card-tooltip-note">{ note }</div> }
		</div>
	);
}
