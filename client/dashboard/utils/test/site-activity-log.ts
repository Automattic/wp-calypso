import MockDate from 'mockdate';
import { getDefaultDateRange } from '../../app/hooks/use-date-range';
import { parseYmdLocal } from '../datetime';
import { buildTimeRangeForActivityLog } from '../site-activity-log';

describe( 'buildTimeRangeForActivityLog', () => {
	afterEach( () => {
		MockDate.reset();
	} );

	it( 'spans from the start of the first day to the end of the last day', () => {
		expect(
			buildTimeRangeForActivityLog( parseYmdLocal( '2026-09-10' )!, parseYmdLocal( '2026-10-09' )! )
		).toEqual( { after: '2026-09-10 00:00:00', before: '2026-10-09 23:59:59' } );
	} );

	// Tests run with TZ=UTC, so these sites are behind the browser's timezone.
	it.each( [
		[ 'America/New_York', -4 ],
		[ 'America/Los_Angeles', -7 ],
		[ '', -5 ],
	] )(
		'includes the site’s today in the default range (timezone %p, offset %p)',
		( tz, offset ) => {
			MockDate.set( new Date( '2026-10-09T15:00:00Z' ) );

			const { start, end } = getDefaultDateRange( tz, offset, 30 );

			expect( buildTimeRangeForActivityLog( start, end ) ).toEqual( {
				after: '2026-09-10 00:00:00',
				before: '2026-10-09 23:59:59',
			} );
		}
	);
} );
