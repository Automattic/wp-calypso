import moment from 'moment-timezone';
import { getPublishMonthKey } from '../publish-month';

// Mirrors getMomentSiteZone's IANA-timezone case: naive strings are
// interpreted as site wall time, absolute inputs are converted into the zone.
const siteZone = ( timezone ) => ( dateInput ) => moment.tz( dateInput, timezone );

describe( 'getPublishMonthKey', () => {
	test( 'reads post_date as site wall time', () => {
		expect(
			getPublishMonthKey( { post_date: '2024-05-01 00:30:00' }, siteZone( 'Pacific/Kiritimati' ) )
		).toBe( '2024-05' );
	} );

	test( 'converts the GMT fallback into the site zone across a month boundary (site ahead of GMT)', () => {
		// Site is UTC+14: 2024-04-30 10:30 GMT is 2024-05-01 00:30 site time,
		// so the publish month is May, not April.
		expect(
			getPublishMonthKey(
				{ post_date_gmt: '2024-04-30 10:30:00' },
				siteZone( 'Pacific/Kiritimati' )
			)
		).toBe( '2024-05' );
	} );

	test( 'converts the GMT fallback into the site zone across a month boundary (site behind GMT)', () => {
		// Site is UTC-10: 2024-05-01 05:00 GMT is 2024-04-30 19:00 site time,
		// so the publish month is April, not May.
		expect(
			getPublishMonthKey( { post_date_gmt: '2024-05-01 05:00:00' }, siteZone( 'Pacific/Honolulu' ) )
		).toBe( '2024-04' );
	} );

	test( 'prefers post_date over post_date_gmt', () => {
		expect(
			getPublishMonthKey(
				{ post_date: '2024-05-01 00:30:00', post_date_gmt: '2024-04-30 10:30:00' },
				siteZone( 'Pacific/Kiritimati' )
			)
		).toBe( '2024-05' );
	} );

	test( 'returns null when the publish date is missing or unparsable', () => {
		const zone = siteZone( 'Pacific/Kiritimati' );
		expect( getPublishMonthKey( undefined, zone ) ).toBeNull();
		expect( getPublishMonthKey( {}, zone ) ).toBeNull();
		expect( getPublishMonthKey( { post_date: 'not-a-date' }, zone ) ).toBeNull();
		expect( getPublishMonthKey( { post_date_gmt: 'not-a-date' }, zone ) ).toBeNull();
	} );
} );
