/**
 * @jest-environment jsdom
 */
import { getShortDateString, getLongDateString } from '../utils';

describe( 'Promote Post Utils', () => {
	test( 'returns short formatted date', () => {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1;
		const currentDate = now.getDate();

		const yesterday = new Date( now.getTime() - 3600 * 24 * 1000 );
		const yesterdayYear = yesterday.getFullYear();
		const yesterdayMonth = yesterday.getMonth() + 1;
		const yesterdayDate = yesterday.getDate();
		const yesterdayHours = yesterday.getHours();
		const yesterdayMinutes = yesterday.getMinutes();
		const yesterdaySeconds = yesterday.getSeconds();

		const previousYear = currentYear - 1;

		const testDataset = [
			{
				// hours ago
				value: `${ currentYear }-${ currentMonth }-${ currentDate } 12:34:56`,
				expected: 'hours ago',
			},
			{
				// 1 day ago
				value: `${ yesterdayYear }-${ yesterdayMonth }-${ yesterdayDate } ${ yesterdayHours }:${ yesterdayMinutes }:${ yesterdaySeconds }`,
				expected: '1 day ago',
			},
			{
				// Jun 15
				value: `${ currentYear }-06-15 12:34:56`,
				expected: 'Jun 15',
			},
			{
				// Jun 15, 2022
				value: `${ previousYear }-06-15 12:34:56`,
				expected: `Jun 15, ${ previousYear }`,
			},
		];

		for ( const item of testDataset ) {
			expect( getShortDateString( item.value ) ).toBe( item.expected );
		}
	} );

	test( 'returns long formatted date', () => {
		const previousYear = new Date().getFullYear() - 1;

		const testDataset = [
			{
				value: `${ previousYear }-06-15 12:34:56`,
				expected: `Jun 15, ${ previousYear } at 12:34 PM`,
			},
		];

		for ( const item of testDataset ) {
			expect( getLongDateString( item.value ) ).toBe( item.expected );
		}
	} );
} );
