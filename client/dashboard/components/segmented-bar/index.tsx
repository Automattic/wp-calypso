import { useViewportMatch } from '@wordpress/compose';
import type { CSSProperties } from 'react';
import './style.scss';

/**
 * A single segment in the SegmentedBar visualisation.
 */
export type SegmentedBarSegment = {
	/** Stable identifier for the segment */
	id: string;
	/** Numeric value that determines the segment size */
	value: number;
	/** Optional text label used for accessibility and analytics */
	label?: string;
	/** Optional custom color; falls back to palette in CSS */
	color?: string;
};

export type SegmentedBarProps = {
	/**
	 * Array of segments to render. The relative size of each segment is
	 * determined by its value relative to the sum (or `total` if provided).
	 */
	segments: SegmentedBarSegment[];
	/**
	 * Minimum percentage shown for a non-zero segment to keep it visible.
	 * Defaults to 2.5% to match small UI density.
	 */
	minPercent?: number;
	/** Optional overall ARIA label for the segmented bar */
	ariaLabel?: string;
	/** Height in pixels, defaults to 16 */
	height?: number;
	/** Border radius in pixels, defaults to 0 (square ends) */
	radius?: number;
	/** Optional gap between segments in pixels. Defaults to 6 (some spacing). */
	gap?: number;
	/** Render labels row above the bar. Defaults to true. */
	showLabels?: boolean;
	/** Custom renderer for label values (e.g., currency). Defaults to raw value. */
	formatValue?: ( value: number, segment: SegmentedBarSegment ) => React.ReactNode;
};

/**
 * Converts raw numeric values into normalized percentages while ensuring a
 * minimum visible size for non-zero buckets.
 */
function normalizePercents( values: number[], minPercent: number ): number[] {
	const sum = values.reduce( ( acc, v ) => acc + v, 0 );
	if ( sum <= 0 || values.length === 0 ) {
		// Nothing to show; render empty bar
		return values.map( () => 0 );
	}

	// Raw percentages based on provided values
	const raw = values.map( ( v ) => ( v <= 0 ? 0 : ( v / sum ) * 100 ) );

	// Ensure visibility for tiny, non-zero buckets
	const adjusted = raw.map( ( p, idx ) => ( values[ idx ] > 0 ? Math.max( p, minPercent ) : 0 ) );
	const adjustedTotal = adjusted.reduce( ( a, b ) => a + b, 0 ) || 1;

	// Normalize back to exactly 100%
	return adjusted.map( ( p ) => ( p / adjustedTotal ) * 100 );
}

/**
 * SegmentedBar renders a single horizontal bar divided into proportional
 * segments. It is intentionally minimal and CSS-driven so it can be moved
 * to a shared chart package in the future.
 */
export default function SegmentedBar( {
	segments,
	minPercent = 2.5,
	ariaLabel,
	height = 16,
	radius = 0,
	gap = 6,
	showLabels = true,
	formatValue,
}: SegmentedBarProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const values = segments.map( ( s ) => s.value );
	const sum = values.reduce( ( a, b ) => a + b, 0 );

	const percents = sum > 0 ? normalizePercents( values, minPercent ) : values.map( () => 0 );

	const containerStyle: CSSProperties = {
		height,
		borderRadius: radius,
		gap,
	};

	return (
		<div className="dashboard-segmented-bar-wrapper">
			{ showLabels && (
				<div
					className={ `dashboard-segmented-bar__labels${
						isSmallViewport ? ' dashboard-segmented-bar__labels--vertical' : ''
					}` }
					aria-hidden
				>
					{ segments.map( ( segment, i ) => {
						const dotStyle: CSSProperties | undefined = segment.color
							? { backgroundColor: segment.color }
							: undefined;
						const value = formatValue ? formatValue( segment.value, segment ) : segment.value;
						return (
							<div
								key={ segment.id }
								className={ `dashboard-segmented-bar__label-item dashboard-segmented-bar__label-item--index-${
									i + 1
								}` }
							>
								<span className="dashboard-segmented-bar__label-dot" style={ dotStyle } />
								<span className="dashboard-segmented-bar__label-text">
									{ segment.label ? `${ segment.label }: ` : '' }
									{ value }
								</span>
							</div>
						);
					} ) }
				</div>
			) }
			<div
				className="dashboard-segmented-bar"
				role="group"
				aria-label={ ariaLabel }
				style={ containerStyle }
			>
				{ segments.map( ( segment, index ) => {
					const weight = percents[ index ] || 0;
					const style: CSSProperties = {
						flexGrow: weight,
						flexBasis: 0,
						backgroundColor: segment.color,
					};
					const aria = segment.label
						? `${ segment.label }: ${ Math.round( weight ) }%`
						: `${ Math.round( weight ) }%`;
					return (
						<div
							key={ segment.id }
							className="dashboard-segmented-bar__segment"
							style={ style }
							aria-label={ aria }
						/>
					);
				} ) }
			</div>
		</div>
	);
}
