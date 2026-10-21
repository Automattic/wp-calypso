import clsx from 'clsx';
import type { CSSProperties } from 'react';

import './style.scss';

export type RangePlotMarker = {
	value: number;
	color?: string;
	ariaLabel?: string;
};

export type RangePlotRange = {
	from: number;
	to: number;
	color?: string;
};

export type RangePlotAxisLabel = {
	value: number;
	label: string;
};

type Props = {
	min?: number;
	max?: number;
	ranges?: RangePlotRange[];
	markers: RangePlotMarker[];
	axisLabels?: RangePlotAxisLabel[];
	className?: string;
	ariaLabel?: string;
};

function toPercent( value: number, min: number, max: number ) {
	if ( max === min ) {
		return 0;
	}
	const pct = ( ( value - min ) / ( max - min ) ) * 100;
	return Math.max( 0, Math.min( 100, pct ) );
}

function getAxisAlign( pct: number ): 'start' | 'center' | 'end' {
	if ( pct <= 0 ) {
		return 'start';
	}
	if ( pct >= 100 ) {
		return 'end';
	}
	return 'center';
}

export default function RangePlot( {
	min = 0,
	max = 100,
	ranges = [],
	markers,
	axisLabels = [],
	className,
	ariaLabel,
}: Props ) {
	return (
		<div className={ clsx( 'a4a-range-plot', className ) } role="img" aria-label={ ariaLabel }>
			<div className="a4a-range-plot__track">
				{ ranges.map( ( range, i ) => {
					const left = toPercent( range.from, min, max );
					const right = toPercent( range.to, min, max );
					const style: CSSProperties = {
						insetInlineStart: `${ left }%`,
						inlineSize: `${ right - left }%`,
					};
					if ( range.color ) {
						style.background = range.color;
					}
					return <div key={ i } className="a4a-range-plot__range" style={ style } />;
				} ) }
				{ markers.map( ( marker, i ) => {
					const style: CSSProperties = {
						insetInlineStart: `${ toPercent( marker.value, min, max ) }%`,
					};
					if ( marker.color ) {
						style.background = marker.color;
					}
					return (
						<div
							key={ i }
							className="a4a-range-plot__marker"
							style={ style }
							role={ marker.ariaLabel ? 'img' : undefined }
							aria-label={ marker.ariaLabel }
						/>
					);
				} ) }
			</div>
			{ axisLabels.length > 0 && (
				<div className="a4a-range-plot__axis">
					{ axisLabels.map( ( tick, i ) => {
						const value = toPercent( tick.value, min, max );
						const align = getAxisAlign( value );
						return (
							<div
								key={ i }
								className={ clsx(
									'a4a-range-plot__axis-tick',
									`a4a-range-plot__axis-tick-${ align }`
								) }
								style={ { insetInlineStart: `${ value }%` } }
							>
								{ tick.label }
							</div>
						);
					} ) }
				</div>
			) }
		</div>
	);
}
