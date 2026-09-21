import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import { Tooltip } from '@wordpress/components';
import { FunctionComponent } from 'react';
import useCountUp from '../hooks/use-count-up';

interface MetricValueProps {
	/** The figure to show. Pass 0 while loading so it counts up once the data lands. */
	value: number;
	/**
	 * Words the full amount for the tooltip, e.g. "1,234 views". Given the formatted
	 * figure rather than a fixed string so each metric can pluralise its own noun.
	 */
	describe: ( formattedValue: string ) => string;
}

/**
 * A metric's figure: counted up on arrival, shown compact ("12.3K"), and — whenever the
 * compact form hides digits — the full amount with its label in a tooltip.
 *
 * The one place every metric's number goes through, so the count-up, the compact
 * format and the tooltip stay the same across Overview and Site protection.
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
