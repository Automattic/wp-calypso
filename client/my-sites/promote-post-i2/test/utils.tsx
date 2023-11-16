/**
 * @jest-environment jsdom
 */
import { getShortDateString, getLongDateString } from '../utils';

describe( 'Promote Post Utils', () => {
	const timestamp = 1687521600000; // 2023-06-23 12:00:00 GMT+0000

	beforeAll( () => {
		jest.useFakeTimers().setSystemTime( timestamp );
	} );

	test.each( [
		[ '2023-06-23T11:57:00+00:00', '3 minutes ago' ],
		[ '2023-06-23T06:00:00+00:00', '6 hours ago' ],
		[ '2023-06-22T12:00:00+00:00', 'a day ago' ],
		[ '2023-06-20T12:00:00+00:00', '3 days ago' ],
		[ '2023-05-17T12:00:00+00:00', 'May 17' ],
		[ '2021-01-10T12:00:00+00:00', 'Jan 10, 2021' ],
	] )( '[%s] returns correct short formatted date: %b', async ( date, expected ) => {
		expect( getShortDateString( date ) ).toBe( expected );
	} );

	test.each( [
		[ '2023-06-23T11:57:00+00:00', 'Today at 11:57 AM' ],
		[ '2022-05-23T06:00:00+00:00', 'May 23, 2022 at 6:00 AM' ],
	] )( '[%s] returns correct long formatted date: %b', async ( date, expected ) => {
		expect( getLongDateString( date ) ).toBe( expected );
	} );

	test( "formats date that doesn't have timezones", () => {
		expect( getShortDateString( '2023-06-23 11:55' ) ).toBe( '5 minutes ago' );
		expect( getLongDateString( '2021-03-22 16:10:00' ) ).toBe( 'Mar 22, 2021 at 4:10 PM' );
	} );
} );
