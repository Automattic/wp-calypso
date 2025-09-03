import { createContext, useContext, useMemo } from 'react';

type GridMetrics = {
	columns: number;
	columnWidth: number;
	gapPx: number;
	rowHeight: number | 'auto';
	spanToPxX: ( span: number ) => number;
	spanToPxY: ( span: number ) => number; // 0 if 'auto'
};

const GridMetricsCtx = createContext< GridMetrics | null >( null );

export function GridMetricsProvider(
	p: React.PropsWithChildren< {
		columns: number;
		columnWidth: number;
		gapPx: number;
		rowHeight: number | 'auto';
	} >
) {
	const value = useMemo< GridMetrics >(
		() => ( {
			columns: p.columns,
			columnWidth: p.columnWidth,
			gapPx: p.gapPx,
			rowHeight: p.rowHeight,
			spanToPxX: ( s ) => s * p.columnWidth + ( s - 1 ) * p.gapPx,
			spanToPxY: ( s ) =>
				p.rowHeight === 'auto' ? 0 : s * ( p.rowHeight as number ) + ( s - 1 ) * p.gapPx,
		} ),
		[ p.columns, p.columnWidth, p.gapPx, p.rowHeight ]
	);

	return <GridMetricsCtx.Provider value={ value }>{ p.children }</GridMetricsCtx.Provider>;
}

export function useGridMetrics() {
	const v = useContext( GridMetricsCtx );
	if ( ! v ) {
		throw new Error( 'useGridMetrics must be used within GridMetricsProvider' );
	}
	return v;
}
