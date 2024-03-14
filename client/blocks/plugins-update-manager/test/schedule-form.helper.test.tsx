import { validateTimeSlot, validatePlugins } from '../schedule-form.helper';

describe( 'Schedule form validation', () => {
	test( 'plugins selection', () => {
		const selectedPlugins = [ 'plugin1', 'plugin2' ];
		const existingPlugins1 = [ [ 'plugin2', 'plugin1', 'plugin3' ] ];
		const existingPlugins2 = [
			[ 'plugin2', 'plugin1', 'plugin3' ],
			[ 'plugin2', 'plugin1' ],
		];

		// Truthy value means there is an error message
		expect( validatePlugins( [] ) ).toBeTruthy();
		expect( validatePlugins( selectedPlugins ) ).toBeFalsy();
		expect( validatePlugins( selectedPlugins, existingPlugins1 ) ).toBeFalsy();
		expect( validatePlugins( selectedPlugins, existingPlugins2 ) ).toBeTruthy();
	} );

	test( 'timestamp / time slot', () => {
		const timestamp = getTwoDaysFutureUTCTime();
		const ts_3am = timestamp + 3 * 60 * 60;
		const ts_9pm = timestamp + 21 * 60 * 60;

		const nextMondayMidnight = getNextMondayMidnightUTCTime();
		const ts_mon_6am = nextMondayMidnight + 6 * 60 * 60;
		const ts_mon_6pm = nextMondayMidnight + 18 * 60 * 60;
		const ts_fri_6am = nextMondayMidnight + 4 * 24 * 60 * 60 + 6 * 60 * 60;
		const ts_fri_6pm = nextMondayMidnight + 4 * 24 * 60 * 60 + 18 * 60 * 60;

		const now = new Date();
		const past = now.getTime() - 1000;

		//
		const existingSchedules = [
			{ frequency: 'daily', timestamp: ts_3am }, // daily at 3:00 am
		];
		const existingSchedules2 = [
			{ frequency: 'weekly', timestamp: ts_mon_6pm }, // weekly on Monday at 6:00 pm
		];
		const existingSchedules3 = [
			{ frequency: 'weekly', timestamp: ts_mon_6pm }, // weekly on Monday at 6:00 pm
			{ frequency: 'daily', timestamp: ts_3am }, // daily at 3:00 am
		];

		// Truthy value means there is an error message
		expect( validateTimeSlot( { frequency: 'daily', timestamp: ts_3am } ) ).toBeFalsy();
		expect( validateTimeSlot( { frequency: 'weekly', timestamp: ts_fri_6am } ) ).toBeFalsy();

		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_9pm }, existingSchedules )
		).toBeFalsy();
		expect(
			validateTimeSlot( { frequency: 'weekly', timestamp: ts_3am }, existingSchedules )
		).toBeTruthy();

		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_mon_6am }, existingSchedules2 )
		).toBeFalsy();
		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_mon_6pm }, existingSchedules2 )
		).toBeTruthy();
		expect(
			validateTimeSlot( { frequency: 'weekly', timestamp: ts_fri_6pm }, existingSchedules2 )
		).toBeFalsy();
		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_fri_6pm }, existingSchedules2 )
		).toBeTruthy();

		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_3am }, existingSchedules3 )
		).toBeTruthy();
		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_9pm }, existingSchedules3 )
		).toBeFalsy();
		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_mon_6am }, existingSchedules3 )
		).toBeFalsy();
		expect(
			validateTimeSlot( { frequency: 'weekly', timestamp: ts_mon_6am }, existingSchedules3 )
		).toBeFalsy();
		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: ts_fri_6pm }, existingSchedules3 )
		).toBeTruthy();
		expect(
			validateTimeSlot( { frequency: 'weekly', timestamp: ts_fri_6pm }, existingSchedules3 )
		).toBeFalsy();

		// One second in the past
		expect(
			validateTimeSlot( { frequency: 'daily', timestamp: past / 1000 }, existingSchedules )
		).toBeTruthy();
	} );

	function getTwoDaysFutureUTCTime() {
		const currentDate = new Date();
		const twoDaysFuture = new Date( currentDate.getTime() + 2 * 24 * 60 * 60 * 1000 );

		twoDaysFuture.setUTCHours( 0, 0, 0, 0 );

		return Math.floor( twoDaysFuture.getTime() / 1000 ); // Returning Unix time in seconds
	}

	function getNextMondayMidnightUTCTime() {
		const currentDate = new Date();
		let daysUntilNextMonday = 1 - currentDate.getUTCDay();

		if ( daysUntilNextMonday <= 0 ) {
			daysUntilNextMonday += 7;
		}

		const nextMonday = new Date(
			currentDate.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000
		); // Adding days to get to next Monday
		nextMonday.setUTCHours( 0, 0, 0, 0 );

		return Math.floor( nextMonday.getTime() / 1000 );
	}
} );
