import { resolveFillWidths } from '../resolve-fill-widths';
import type { GridLayoutItem } from '../types';

function makeMap( items: GridLayoutItem[] ): Map< string, GridLayoutItem > {
	const map = new Map< string, GridLayoutItem >();
	items.forEach( ( item ) => map.set( item.key, item ) );
	return map;
}

function keys( items: GridLayoutItem[] ): string[] {
	return items.map( ( item ) => item.key );
}

describe( 'resolveFillWidths', () => {
	it( 'returns empty map when no items have fillWidth', () => {
		const items: GridLayoutItem[] = [
			{ key: 'a', width: 2 },
			{ key: 'b', width: 4 },
		];
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.size ).toBe( 0 );
	} );

	it( 'fill item takes all columns when alone', () => {
		const items: GridLayoutItem[] = [ { key: 'fill', fillWidth: true } ];
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 6 );
	} );

	it( 'fill item takes remaining columns after fixed items', () => {
		const items: GridLayoutItem[] = [
			{ key: 'sidebar', width: 1 },
			{ key: 'fill', fillWidth: true },
		];
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 5 );
	} );

	it( 'fill item reserves space for subsequent fixed items', () => {
		const items: GridLayoutItem[] = [
			{ key: 'left', width: 1 },
			{ key: 'fill', fillWidth: true },
			{ key: 'right', width: 2 },
		];
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 3 );
	} );

	it( 'fill after fullWidth starts a new row', () => {
		const items: GridLayoutItem[] = [
			{ key: 'full', fullWidth: true },
			{ key: 'fill', fillWidth: true },
			{ key: 'sidebar', width: 1 },
		];
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 5 );
	} );

	it( 'consecutive fills each take a full row', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill-1', fillWidth: true },
			{ key: 'fill-2', fillWidth: true },
		];
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill-1' ) ).toBe( 6 );
		expect( result.get( 'fill-2' ) ).toBe( 6 );
	} );

	it( 'does not reserve items that overflow the row', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill', fillWidth: true },
			{ key: 'a', width: 3 },
			{ key: 'b', width: 4 },
		];
		// 6 cols: fill + a(3) = fill needs 3 cols. b(4) overflows → not reserved.
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 3 );
	} );

	it( 'clamps item widths to maxColumns', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill', fillWidth: true },
			{ key: 'wide', width: 10 },
		];
		// In 4 cols, wide is clamped to 4. fill + wide(4) → fill can't reserve
		// wide (1 + 4 > 4), so fill gets all 4 cols.
		const result = resolveFillWidths( keys( items ), makeMap( items ), 4 );
		expect( result.get( 'fill' ) ).toBe( 4 );
	} );

	it( 'fill in the middle of a row', () => {
		const items: GridLayoutItem[] = [
			{ key: 'a', width: 1 },
			{ key: 'b', width: 1 },
			{ key: 'fill', fillWidth: true },
			{ key: 'c', width: 1 },
		];
		// 6 cols: a(1) + b(1) + fill + c(1) → fill = 6 - 2 - 1 = 3
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 3 );
	} );

	it( 'multiple fills in different rows', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill-1', fillWidth: true },
			{ key: 'sidebar-1', width: 1 },
			{ key: 'full', fullWidth: true },
			{ key: 'fill-2', fillWidth: true },
			{ key: 'sidebar-2', width: 2 },
		];
		// Row 1: fill-1 + sidebar-1(1) → fill-1 = 5
		// fullWidth resets row
		// Row 2: fill-2 + sidebar-2(2) → fill-2 = 4
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill-1' ) ).toBe( 5 );
		expect( result.get( 'fill-2' ) ).toBe( 4 );
	} );

	it( 'fill gets minimum of 1 column when row is almost full', () => {
		const items: GridLayoutItem[] = [
			{ key: 'a', width: 3 },
			{ key: 'b', width: 2 },
			{ key: 'fill', fillWidth: true },
		];
		// 6 cols: a(3) + b(2) = 5, fill gets 1
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 1 );
	} );

	it( 'adapts to different column counts (responsive)', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill', fillWidth: true },
			{ key: 'sidebar', width: 1 },
		];
		expect( resolveFillWidths( keys( items ), makeMap( items ), 6 ).get( 'fill' ) ).toBe( 5 );
		expect( resolveFillWidths( keys( items ), makeMap( items ), 4 ).get( 'fill' ) ).toBe( 3 );
		expect( resolveFillWidths( keys( items ), makeMap( items ), 2 ).get( 'fill' ) ).toBe( 1 );
	} );

	it( 'look-ahead stops at fillWidth boundary', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill-1', fillWidth: true },
			{ key: 'fill-2', fillWidth: true },
			{ key: 'sidebar', width: 1 },
		];
		// fill-1 look-ahead stops at fill-2 → fill-1 gets 6
		// fill-2 look-ahead sees sidebar(1) → fill-2 gets 5
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill-1' ) ).toBe( 6 );
		expect( result.get( 'fill-2' ) ).toBe( 5 );
	} );

	it( 'look-ahead stops at fullWidth boundary', () => {
		const items: GridLayoutItem[] = [
			{ key: 'fill', fillWidth: true },
			{ key: 'full', fullWidth: true },
			{ key: 'sidebar', width: 1 },
		];
		// fill look-ahead stops at full → fill gets 6
		const result = resolveFillWidths( keys( items ), makeMap( items ), 6 );
		expect( result.get( 'fill' ) ).toBe( 6 );
	} );
} );
