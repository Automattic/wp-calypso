import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import { Tooltip } from '@wordpress/components';
import { FunctionComponent } from 'react';
import useCountUp from '../hooks/use-count-up';

interface MetricValueProps {
	/** The figure to show. Pass 0 while loading so it counts up once the data lands. */
	value: number;
	/** Words the full amount for the tooltip, e.g. "1,234 views". */
	describe: ( formattedValue: string ) => string;
}

/**
 * A metric's figure: counted up on arrival, shown compact ("12.3K"), with the full amount
 * in a tooltip whenever the compact form hides digits.
 */
const MetricValue: FunctionComponent< MetricValueProps > = ( { value, describe } ) => {
	const displayedValue = useCountUp( value );
	const compact = formatNumberCompact( Math.round( displayedValue ) );

	const figure = <div className="stats-widget-metric__value">{ compact }</div>;

	// Compared on the settled value, so the tooltip does not come and go mid-count.
	if ( formatNumberCompact( value ) === formatNumber( value ) ) {
		return figure;
	}

	return (
		<Tooltip text={ describe( formatNumber( value ) ) } placement="top">
			{ figure }
		</Tooltip>
	);
};

export default MetricValue;
