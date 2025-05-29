import { arrowDown, arrowUp, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { formatPercentage, subtract, percentCalculator } from './lib/numbers';

type TrendComparisonProps = {
	count: number | null;
	previousCount?: number | null;
};

export function TrendComparison( { count, previousCount }: TrendComparisonProps ) {
	const difference = subtract( count, previousCount );
	const percentage = Number.isFinite( difference )
		? percentCalculator( Math.abs( difference as number ), previousCount )
		: null;

	// Show nothing if inputs are invalid or if there is no change.
	if ( difference === null || difference === 0 ) {
		return null;
	}

	return Math.abs( difference ) === 0 ? null : (
		<span
			className={ clsx( 'highlight-card-difference', {
				'highlight-card-difference--positive': difference < 0,
				'highlight-card-difference--negative': difference > 0,
			} ) }
		>
			<span className="highlight-card-difference-icon">
				{ difference < 0 && <Icon size={ 18 } icon={ arrowDown } /> }
				{ difference > 0 && <Icon size={ 18 } icon={ arrowUp } /> }
			</span>
			{ percentage !== null && (
				<span className="highlight-card-difference-absolute-percentage">
					{ ' ' }
					{ formatPercentage( percentage ) }
				</span>
			) }
		</span>
	);
}
