import { createContext, useContext } from 'react';

export type GridItemSize = {
	widthPx: number;
	heightPx: number;
	cols: number;
	rows: number;
};

type GridItemCtx = { id: string; size: GridItemSize };

const GridItemContext = createContext< GridItemCtx | null >( null );

export function GridItemSizeProvider( props: React.PropsWithChildren< GridItemCtx > ) {
	return <GridItemContext.Provider value={ props }>{ props.children }</GridItemContext.Provider>;
}

export function useGridItemSize(): GridItemSize {
	const v = useContext( GridItemContext );
	if ( ! v ) {
		throw new Error( 'useGridItemSize must be used within a GridItem' );
	}
	return v.size;
}
