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
		const ts_3am = 1709172000;
		const ts_9pm = 1709236800;
		const ts_mon_6am = 1709528400;
		const ts_mon_6pm = 1709226000;
		const ts_fri_6am = 1709269200;
		const ts_fri_6pm = 1709312400;

		const existingSchedules = [
			{ frequency: 'daily', timestamp: 1709085600 }, // daily at 3:00 am
		];
		const existingSchedules2 = [
			{ frequency: 'weekly', timestamp: 1709571600 }, // weekly on Monday at 6:00 pm
		];
		const existingSchedules3 = [
			{ frequency: 'weekly', timestamp: 1709571600 }, // weekly on Monday at 6:00 pm
			{ frequency: 'daily', timestamp: 1709085600 }, // daily at 3:00 am
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
	} );
} );
