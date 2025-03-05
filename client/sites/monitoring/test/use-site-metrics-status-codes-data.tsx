/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useGroupByTime } from '../hooks/use-group-by-time';
import { PeriodData } from '../hooks/use-metrics-query';

const periods: PeriodData[] = [
	{
		timestamp: 1691664300, // Initial timestamp in seconds
		dimension: {
			'200': 0.2377777777777777,
			'301': 0.012222222222222223,
			'302': 0.0011111111111111111,
			'304': 0.024444444444444446,
			'404': 0.0033333333333333335,
		},
	},
	{
		timestamp: 1691664300 + 300,
		dimension: {
			'200': 0.2744444444444444,
			'404': 0.005555555555555556,
		},
	},
	{
		timestamp: 1691664300 + 600,
		dimension: {
			'200': 0.2744444444444444,
			'301': 0.0044444444444444444,
		},
	},
	{
		timestamp: 1691664300 + 800,
		dimension: {
			'200': 0.2744444444444444,
			'301': 0.0044444444444444444,
			'304': 0.027777777777777776,
			'404': 0.005555555555555556,
		},
	},
	{
		timestamp: 1691664300 + 900,
		dimension: {
			'200': 0.2744444444444444,
		},
	},
];

const data = {
	_meta: {
		start: 1691150400,
		end: 1691762400,
		resolution: 7200,
		metric: 'requests_persec',
		dimension: 'http_status',
		took: 604,
	},
	periods,
};

describe( 'useGroupByTime hook', () => {
	it( 'should group data by time windows correctly', () => {
		const { result } = renderHook( () => useGroupByTime( data, [ 200, 301, 302, 304, 404 ] ) );
		const { groupedData, dataGroupedByTime, labels } = result.current;

		expect( Object.keys( groupedData ).length ).toBe( 5 );
		expect( groupedData ).toStrictEqual( {
			'1691664300': {
				'200': 14.266666666666662,
				'301': 0.7333333333333334,
				'302': 0.06666666666666667,
				'304': 1.4666666666666668,
				'404': 0.2,
			},
			'1691664600': { '200': 16.46666666666666, '404': 0.33333333333333337 },
			'1691664900': { '200': 16.46666666666666, '301': 0.26666666666666666 },
			'1691665100': {
				'200': 16.46666666666666,
				'301': 0.26666666666666666,
				'304': 1.6666666666666665,
				'404': 0.33333333333333337,
			},
			'1691665200': { '200': 16.46666666666666 },
		} );
		expect( dataGroupedByTime ).toEqual( [
			[
				14.266666666666662, 16.46666666666666, 16.46666666666666, 16.46666666666666,
				16.46666666666666,
			],
			[ 0.7333333333333334, 0, 0.26666666666666666, 0.26666666666666666, 0 ],
			[ 0.06666666666666667, 0, 0, 0, 0 ],
			[ 1.4666666666666668, 0, 0, 1.6666666666666665, 0 ],
			[ 0.2, 0.33333333333333337, 0, 0.33333333333333337, 0 ],
		] );
		expect( labels.length ).toEqual( 5 );
		expect( labels ).toEqual( [
			1691664300,
			1691664300 + 300,
			1691664300 + 600,
			1691664300 + 800,
			1691664300 + 900,
		] );
	} );

	it( 'should correctly handle missing status codes', () => {
		const { result } = renderHook( () => useGroupByTime( data, [ 444 ] ) );
		const { dataGroupedByTime } = result.current;

		expect( dataGroupedByTime ).toEqual( [ [ 0, 0, 0, 0, 0 ] ] );
	} );

	it( 'should return empty arrays if no periods given', () => {
		const { result } = renderHook( () => useGroupByTime( undefined, [ 200, 301 ] ) );
		const { groupedData, dataGroupedByTime, labels } = result.current;

		expect( groupedData ).toEqual( {} );
		expect( dataGroupedByTime ).toEqual( [ [], [] ] );
		expect( labels ).toEqual( [] );
	} );
} );
