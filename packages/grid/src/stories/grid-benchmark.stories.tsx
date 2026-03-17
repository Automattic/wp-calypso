import { Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Grid } from '../grid';
import type { GridLayoutItem } from '../types';
import type { Meta, StoryObj } from '@storybook/react';

interface BenchmarkArgs {
	itemCount: number;
	fillWidthRatio: number;
	fullWidthRatio: number;
	columns: number;
	minColumnWidth: number;
	responsive: boolean;
	rowHeight: number;
	editMode: boolean;
}

const meta: Meta = {
	title: 'Grid/Benchmark',
	parameters: { layout: '' },
	argTypes: {
		itemCount: {
			control: { type: 'range', min: 10, max: 2000, step: 10 },
			description: 'Number of grid items to render',
		},
		fillWidthRatio: {
			control: { type: 'range', min: 0, max: 1, step: 0.05 },
			description: 'Ratio of items with fillWidth (0 = none, 1 = all)',
		},
		fullWidthRatio: {
			control: { type: 'range', min: 0, max: 1, step: 0.05 },
			description: 'Ratio of items with fullWidth (0 = none, 1 = all)',
		},
		columns: {
			control: { type: 'range', min: 1, max: 12, step: 1 },
			description: 'Fixed column count (used when responsive is off)',
		},
		minColumnWidth: {
			control: { type: 'range', min: 60, max: 400, step: 10 },
			description: 'Minimum column width in px (used when responsive is on)',
		},
		responsive: {
			control: 'boolean',
			description: 'Use minColumnWidth instead of fixed columns',
		},
		rowHeight: {
			control: { type: 'range', min: 20, max: 200, step: 10 },
			description: 'Row height in px',
		},
		editMode: {
			control: 'boolean',
			description: 'Enable drag and resize',
		},
	},
};
export default meta;

interface TimingEntry {
	label: string;
	actualDuration: number;
	baseDuration: number;
}

function generateLayout(
	count: number,
	fillWidthRatio: number,
	fullWidthRatio: number
): GridLayoutItem[] {
	const items: GridLayoutItem[] = [];
	const fillEvery = fillWidthRatio > 0 ? Math.round( 1 / fillWidthRatio ) : 0;
	const fullEvery = fullWidthRatio > 0 ? Math.round( 1 / fullWidthRatio ) : 0;

	for ( let i = 0; i < count; i++ ) {
		const useFull = fullEvery > 0 && i % fullEvery === 0;
		const useFill = ! useFull && fillEvery > 0 && i % fillEvery === 0;
		const item: GridLayoutItem = useFull
			? { key: `item-${ i }`, height: 1, order: i, fullWidth: true }
			: {
					key: `item-${ i }`,
					width: useFill ? undefined : ( i % 3 ) + 1,
					height: 1,
					order: i,
					fillWidth: useFill || undefined,
			  };
		items.push( item );
	}
	return items;
}

function TimingPanel( {
	peak,
	avg,
	count,
}: {
	peak: TimingEntry | null;
	avg: number;
	count: number;
} ) {
	if ( ! peak ) {
		return (
			<div
				style={ {
					padding: 12,
					background: '#1a1a2e',
					color: '#666',
					borderRadius: 4,
					fontFamily: 'monospace',
					fontSize: 12,
					marginBottom: 16,
				} }
			>
				Waiting for renders...
			</div>
		);
	}

	return (
		<div
			style={ {
				padding: 12,
				background: '#1a1a2e',
				color: '#e0e0e0',
				borderRadius: 4,
				fontFamily: 'monospace',
				fontSize: 12,
				marginBottom: 16,
				position: 'sticky',
				top: 0,
				zIndex: 10,
			} }
		>
			<div style={ { marginBottom: 8, color: '#00d4ff' } }>
				<strong>Render timings ({ count } samples)</strong>
			</div>
			<table style={ { borderCollapse: 'collapse', width: '100%' } }>
				<thead>
					<tr style={ { borderBottom: '1px solid #333', textAlign: 'left' } }>
						<th style={ { padding: '4px 8px' } }>Metric</th>
						<th style={ { padding: '4px 8px' } }>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={ { padding: '4px 8px' } }>Peak render (actual)</td>
						<td style={ { padding: '4px 8px' } }>{ peak.actualDuration.toFixed( 2 ) }ms</td>
					</tr>
					<tr>
						<td style={ { padding: '4px 8px' } }>Peak render (base)</td>
						<td style={ { padding: '4px 8px' } }>{ peak.baseDuration.toFixed( 2 ) }ms</td>
					</tr>
					<tr>
						<td style={ { padding: '4px 8px' } }>Average (actual)</td>
						<td style={ { padding: '4px 8px' } }>{ avg.toFixed( 2 ) }ms</td>
					</tr>
					<tr>
						<td style={ { padding: '4px 8px' } }>Trigger</td>
						<td style={ { padding: '4px 8px' } }>{ peak.label }</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

/** Grid performance benchmark. Uses `React.Profiler` + Storybook controls. */
export const Benchmark: StoryObj< BenchmarkArgs > = {
	args: {
		itemCount: 500,
		fillWidthRatio: 0,
		fullWidthRatio: 0,
		columns: 6,
		minColumnWidth: 120,
		responsive: false,
		rowHeight: 40,
		editMode: true,
	},
	render: function BenchmarkStory( args: BenchmarkArgs ) {
		const {
			itemCount,
			fillWidthRatio,
			fullWidthRatio,
			columns,
			minColumnWidth,
			responsive,
			rowHeight,
			editMode,
		} = args;

		const generatedLayout = useMemo(
			() => generateLayout( itemCount, fillWidthRatio, fullWidthRatio ),
			[ itemCount, fillWidthRatio, fullWidthRatio ]
		);

		const [ layout, setLayout ] = useState( generatedLayout );

		// Sync layout state when controls change
		useEffect( () => {
			setLayout( generatedLayout );
		}, [ generatedLayout ] );

		const timingsRef = useRef< TimingEntry[] >( [] );
		const lastReadIndex = useRef( 0 );
		const [ displayTiming, setDisplayTiming ] = useState< {
			peak: TimingEntry | null;
			avg: number;
			count: number;
		} >( { peak: null, avg: 0, count: 0 } );

		const configLabel = useMemo( () => {
			const parts = [
				`${ itemCount } items`,
				`fill=${ ( fillWidthRatio * 100 ).toFixed( 0 ) }%`,
				`full=${ ( fullWidthRatio * 100 ).toFixed( 0 ) }%`,
				responsive ? `minCol=${ minColumnWidth }` : `cols=${ columns }`,
			];
			return parts.join( ', ' );
		}, [ itemCount, fillWidthRatio, fullWidthRatio, responsive, minColumnWidth, columns ] );

		const pendingLabel = useRef( configLabel );
		useEffect( () => {
			pendingLabel.current = configLabel;
		}, [ configLabel ] );

		const nextId = useRef( itemCount );

		const handleChangeLayout = useCallback( ( newLayout: GridLayoutItem[] ) => {
			pendingLabel.current = 'drag/resize';
			setLayout( newLayout );
		}, [] );

		const addTile = useCallback( () => {
			setLayout( ( prev ) => {
				const pos = Math.floor( Math.random() * ( prev.length + 1 ) );
				const id = nextId.current++;
				const key = `item-${ id }`;
				pendingLabel.current = `add ${ key } at position ${ pos }`;
				const newItem: GridLayoutItem = {
					key,
					width: Math.floor( Math.random() * 3 ) + 1,
					height: 1,
				};
				const next = [ ...prev ];
				next.splice( pos, 0, newItem );
				return next.map( ( item, i ) => ( { ...item, order: i } ) );
			} );
		}, [] );

		const removeTile = useCallback( () => {
			setLayout( ( prev ) => {
				if ( prev.length === 0 ) {
					return prev;
				}
				const pos = Math.floor( Math.random() * prev.length );
				pendingLabel.current = `remove ${ prev[ pos ].key } from position ${ pos }`;
				return prev.filter( ( _, i ) => i !== pos );
			} );
		}, [] );

		const onRender = useCallback(
			( _id: string, _phase: string, actualDuration: number, baseDuration: number ) => {
				timingsRef.current = [
					...timingsRef.current,
					{ label: pendingLabel.current, actualDuration, baseDuration },
				];
			},
			[]
		);

		// Update display when config or layout changes (drag/resize).
		// Shows the peak (highest actual) from the batch since the last read,
		// so we don't miss expensive renders hidden behind cheap follow-ups.
		useEffect( () => {
			const id = setTimeout( () => {
				const all = timingsRef.current;
				if ( all.length === 0 ) {
					return;
				}

				// Find peak actual duration in the new samples since last read
				let peak = all[ all.length - 1 ];
				for ( let i = lastReadIndex.current; i < all.length; i++ ) {
					if ( all[ i ].actualDuration > peak.actualDuration ) {
						peak = all[ i ];
					}
				}
				lastReadIndex.current = all.length;

				const avg = all.reduce( ( s, e ) => s + e.actualDuration, 0 ) / all.length;
				setDisplayTiming( { peak, avg, count: all.length } );
			}, 100 );
			return () => clearTimeout( id );
		}, [ configLabel, layout ] );

		const fillCount = layout.filter( ( i ) => i.fillWidth ).length;
		const fullCount = layout.filter( ( i ) => i.fullWidth ).length;

		const children = useMemo(
			() =>
				layout.map( ( item ) => {
					const hue = ( parseInt( item.key.split( '-' )[ 1 ], 10 ) * 37 ) % 360;
					return (
						<div
							key={ item.key }
							style={ {
								backgroundColor: `hsl(${ hue }, 50%, 50%)`,
								color: 'white',
								fontSize: 10,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
							} }
						>
							{ item.key }
							{ item.fillWidth ? ' (fill)' : '' }
							{ item.fullWidth ? ' (full)' : '' }
						</div>
					);
				} ),
			[ layout ]
		);

		const mono = { fontFamily: 'monospace', fontSize: 11 } as const;
		const th = { padding: '3px 8px', textAlign: 'left' as const, fontWeight: 600 };
		const td = { padding: '3px 8px' };
		const dimColor = '#999';

		return (
			<div>
				<TimingPanel
					peak={ displayTiming.peak }
					avg={ displayTiming.avg }
					count={ displayTiming.count }
				/>

				<div
					style={ {
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						fontSize: 12,
						color: '#888',
						marginBottom: 8,
					} }
				>
					<span>
						{ layout.length } items
						{ responsive
							? ` | responsive (minColumnWidth=${ minColumnWidth })`
							: ` | static (columns=${ columns })` }
						{ ` | ${ fillCount } fill (${ ( fillWidthRatio * 100 ).toFixed( 0 ) }%)` }
						{ ` | ${ fullCount } full (${ ( fullWidthRatio * 100 ).toFixed( 0 ) }%)` }
					</span>
					<button
						onClick={ addTile }
						style={ {
							padding: '2px 8px',
							fontSize: 11,
							cursor: 'pointer',
						} }
					>
						+ Add tile
					</button>
					<button
						onClick={ removeTile }
						style={ {
							padding: '2px 8px',
							fontSize: 11,
							cursor: 'pointer',
						} }
					>
						- Remove tile
					</button>
				</div>

				<div style={ { marginTop: 16, ...mono, color: '#666', lineHeight: 1.6 } }>
					<p style={ { margin: '0 0 6px' } }>
						Uses <code>React.Profiler</code> to measure render times. <strong>actual</strong> = real
						cost (with memoization), <strong>base</strong> = worst-case (no memo). Change a control
						to record a sample.
					</p>

					<p style={ { margin: '8px 0 4px', fontWeight: 600 } }>Stress scenarios</p>
					<table style={ { borderCollapse: 'collapse', width: '100%', fontSize: 11 } }>
						<thead>
							<tr style={ { borderBottom: '1px solid #ddd' } }>
								<th style={ th }>Scenario</th>
								<th style={ th }>Config</th>
								<th style={ th }>Why</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td style={ td }>Many items</td>
								<td style={ { ...td, color: dimColor } }>2000 items, fill=0</td>
								<td style={ td }>Baseline: pure DOM volume</td>
							</tr>
							<tr>
								<td style={ td }>High fill</td>
								<td style={ { ...td, color: dimColor } }>1000 items, fill=50%</td>
								<td style={ td }>Most fill items with look-ahead, highest constant factor</td>
							</tr>
							<tr>
								<td style={ td }>All fill</td>
								<td style={ { ...td, color: dimColor } }>1000 items, fill=100%</td>
								<td style={ td }>Look-ahead breaks instantly, cheaper than 50%</td>
							</tr>
							<tr>
								<td style={ td }>Responsive + fill</td>
								<td style={ { ...td, color: dimColor } }>responsive, fill=30%</td>
								<td style={ td }>Column reflow invalidates fillWidthMap memo</td>
							</tr>
							<tr>
								<td style={ td }>Many columns</td>
								<td style={ { ...td, color: dimColor } }>12 cols, 1000 items</td>
								<td style={ td }>More items per row, longer look-ahead</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Profiler id="grid-benchmark" onRender={ onRender }>
					<Grid
						layout={ layout }
						{ ...( responsive ? { minColumnWidth } : { columns } ) }
						rowHeight={ rowHeight }
						spacing={ 1 }
						editMode={ editMode }
						onChangeLayout={ handleChangeLayout }
					>
						{ children }
					</Grid>
				</Profiler>
			</div>
		);
	},
};
