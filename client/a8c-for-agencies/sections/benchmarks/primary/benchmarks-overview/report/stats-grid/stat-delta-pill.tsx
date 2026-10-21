import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { formatQuarterShort } from '../../../../lib/format-quarter';
import type { Quarter } from '../../../../constants';

type Props = {
	delta: number;
	formatDelta: ( signedDelta: number ) => string;
	previousQuarter: Quarter;
	higherIsBetter: boolean;
};

function getTone( delta: number, higherIsBetter: boolean ): 'up' | 'down' | 'neutral' {
	if ( delta === 0 ) {
		return 'neutral';
	}
	const isPositiveDirection = higherIsBetter ? delta > 0 : delta < 0;
	return isPositiveDirection ? 'up' : 'down';
}

export default function StatDeltaPill( {
	delta,
	formatDelta,
	previousQuarter,
	higherIsBetter,
}: Props ) {
	const tone = getTone( delta, higherIsBetter );

	return (
		<span className={ clsx( 'benchmarks-stat-delta-pill', `is-${ tone }` ) }>
			{ sprintf(
				/* translators: %1$s: signed delta (e.g. "+7.3%"), %2$s: previous quarter shorthand (e.g. "Q3 24"). */
				__( '%1$s vs %2$s' ),
				formatDelta( delta ),
				formatQuarterShort( previousQuarter )
			) }
		</span>
	);
}
