import getCurrentUserTimeSinceSignup from '../get-current-user-time-since-signup';

describe( 'getCurrentUserTimeSinceSignup()', () => {
	beforeAll( () => {
		// Time travel.
		jest
			.useFakeTimers()
			// Mock date => 2022-01-01T05:04:12+00:00.
			.setSystemTime( new Date( 1641013452000 ) );
	} );

	afterAll( () => {
		// Back to present.
		jest.useRealTimers();
	} );

	test( 'It should return the correct amount of days from the user signup date', () => {
		// Fake global state.
		const prevState = {
			currentUser: {
				user: {
					date: '2013-02-12T23:34:51+00:00',
				},
			},
		};

		const howManyDays = getCurrentUserTimeSinceSignup( prevState );

		// It should be 3244 days
		expect( howManyDays ).toEqual( 3244 );
	} );

	test( 'It should round down the date difference to nearest day', () => {
		// Fake global state.
		const prevState = {
			currentUser: {
				user: {
					date: '2022-01-01T03:04:12+00:00',
				},
			},
		};

		const howManyDays = getCurrentUserTimeSinceSignup( prevState );

		// It should be 0 (2 hours)
		expect( howManyDays ).toEqual( 0 );
	} );

	test( 'It should round up the date difference to nearest day', () => {
		// Fake global state.
		const prevState = {
			currentUser: {
				user: {
					date: '2021-12-31T10:04:12+00:00',
				},
			},
		};

		const howManyDays = getCurrentUserTimeSinceSignup( prevState );

		// It should be 1 (19 hours)
		expect( howManyDays ).toEqual( 1 );
	} );
} );
