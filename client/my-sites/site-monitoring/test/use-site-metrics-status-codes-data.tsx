import { renderHook } from '@testing-library/react-hooks';
import { useGroupByTime } from '../hooks/use-group-by-time';

const periods = [
	{
		timestamp: 1691664300, // Initial timestamp in seconds
		dimension: {
			'200': 0.43777777777777777,
			'301': 0.012222222222222223,
			'302': 0.0011111111111111111,
			'304': 0.024444444444444446,
			'404': 0.0033333333333333335,
		},
	},
	{
		timestamp: 1691664300 + 300,
		dimension: {
			'200': 0.47444444444444445,
			'404': 0.005555555555555556,
		},
	},
	{
		timestamp: 1691664300 + 600,
		dimension: {
			'200': 0.47444444444444445,
			'301': 0.0044444444444444444,
		},
	},
	{
		timestamp: 1691664300 + 800,
		dimension: {
			'200': 0.47444444444444445,
			'301': 0.0044444444444444444,
			'304': 0.027777777777777776,
			'404': 0.005555555555555556,
		},
	},
	{
		timestamp: 1691664300 + 900,
		dimension: {
			'200': 0.47444444444444445,
		},
	},
];

describe( 'useGroupByTime hook', () => {
	it( 'should group data by time windows correctly', () => {
		const { result } = renderHook( () =>
			useGroupByTime( periods, 600, [ 200, 301, 302, 304, 404 ] )
		);
		const { groupedData, dataGroupedByTime, labels } = result.current;

		expect( Object.keys( groupedData ).length ).toBe( 2 );
		expect( Object.values( groupedData ) ).toStrictEqual( [
			{ '200': 2, '301': 1, '302': 1, '304': 1, '404': 2 },
			{ '200': 3, '301': 2, '304': 1, '404': 1 },
		] );
		expect( dataGroupedByTime ).toEqual( [
			[ 2, 3 ], // 200
			[ 1, 2 ], // 301
			[ 1, 0 ], // 302
			[ 1, 1 ], // 304
			[ 2, 1 ], // 404
		] );
		expect( labels.length ).toEqual( 2 );
		expect( labels ).toEqual( [ 1691664300, 1691664900 ] );
	} );

	it( 'should group data by a bigger time window correctly', () => {
		const { result } = renderHook( () =>
			useGroupByTime( periods, 3600, [ 200, 301, 302, 304, 404 ] )
		);
		const { groupedData, dataGroupedByTime, labels } = result.current;

		expect( Object.keys( groupedData ).length ).toBe( 1 );
		expect( Object.values( groupedData ) ).toStrictEqual( [
			{ '200': 5, '301': 3, '302': 1, '304': 2, '404': 3 },
		] );
		expect( dataGroupedByTime ).toEqual( [
			[ 5 ], // 200
			[ 3 ], // 301
			[ 1 ], // 302
			[ 2 ], // 304
			[ 3 ], // 404
		] );
		expect( labels.length ).toEqual( 1 );
		expect( labels ).toEqual( [ 1691664300 ] );
	} );

	it( 'should correctly handle missing status codes', () => {
		const { result } = renderHook( () => useGroupByTime( periods, 3600, [ 444 ] ) );
		const { dataGroupedByTime } = result.current;

		expect( dataGroupedByTime ).toEqual( [ [ 0 ] ] );
	} );

	it( 'should return empty arrays if no periods given', () => {
		const { result } = renderHook( () => useGroupByTime( [], 3600, [ 200, 301 ] ) );
		const { groupedData, dataGroupedByTime, labels } = result.current;

		expect( groupedData ).toEqual( {} );
		expect( dataGroupedByTime ).toEqual( [ [], [] ] );
		expect( labels ).toEqual( [] );
	} );
} );
