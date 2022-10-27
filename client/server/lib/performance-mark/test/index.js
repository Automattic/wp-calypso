import performanceMark, { finalizePerfMarks } from '../';

describe( 'performanceMark', () => {
	beforeAll( () => {
		jest.useFakeTimers();
	} );

	it( 'does nothing if the context has not been created', () => {
		const req = {};
		performanceMark( req, 'test-marker' );
		expect( Object.keys( req ).length ).toBe( 0 );
	} );

	it( "creates the performance marks array if it doesn't exist", () => {
		const req = { context: {} };
		performanceMark( req, 'test-marker' );
		expect( req.context.performanceMarks.length ).toBe( 1 );
	} );

	it( 'adds a new performance marker with the current time', () => {
		const req = { context: {} };
		performanceMark( req, 'test-1' );
		expect( req.context.performanceMarks[ 0 ] ).toStrictEqual( {
			markName: 'test-1',
			startTime: Date.now(),
		} );
	} );

	it( 'adds a new step to the current main mark as a child', () => {
		const req = { context: {} };
		performanceMark( req, 'parent-1' );
		performanceMark( req, 'child-1', true );

		const marks = req.context.performanceMarks;
		expect( marks.length ).toBe( 1 );
		expect( marks[ 0 ].steps.length ).toBe( 1 );
		expect( marks[ 0 ].markName ).toBe( 'parent-1' );
		expect( marks[ 0 ].steps[ 0 ].markName ).toBe( 'child-1' );
	} );

	it( 'updates the duration of a mark and its children', () => {
		// Number of ms between some steps.
		const duration1 = 5001;
		const duration2 = 203;
		const duration3 = 101;
		const req = { context: {} };

		performanceMark( req, 'parent-1' );
		performanceMark( req, 'child-1', true );
		jest.advanceTimersByTime( duration1 );
		performanceMark( req, 'child-2', true );
		jest.advanceTimersByTime( duration2 );
		performanceMark( req, 'parent-2' );
		jest.advanceTimersByTime( duration3 );
		performanceMark( req, 'parent-3' );
		performanceMark( req, 'child-3', true );

		const marks = req.context.performanceMarks;
		// The children are logged with the correct duration.
		expect( marks[ 0 ].steps.length ).toBe( 2 );
		expect( marks[ 0 ].steps[ 0 ].markName ).toBe( 'child-1' );
		expect( marks[ 0 ].steps[ 0 ].duration ).toBe( duration1 );
		expect( marks[ 0 ].steps[ 1 ].markName ).toBe( 'child-2' );
		expect( marks[ 0 ].steps[ 1 ].duration ).toBe( duration2 );

		// The first parent's duration ends up being the sum of the children's duration.
		expect( marks[ 0 ].markName ).toBe( 'parent-1' );
		expect( marks[ 0 ].duration ).toBe( duration1 + duration2 );

		// The second parent has no children, and is just the interval between the second and third parents.
		expect( marks[ 1 ].markName ).toBe( 'parent-2' );
		expect( marks[ 1 ].duration ).toBe( duration3 );

		// The third parent has an undefined duration because it's unfinished, despite having a child.
		expect( marks[ 2 ].steps.length ).toBe( 1 );
		expect( marks[ 2 ].markName ).toBe( 'parent-3' );
		expect( marks[ 2 ].duration ).toBeUndefined();

		expect( marks.length ).toBe( 3 );
	} );

	it( 'adds a new parent step as a parent', () => {
		const req = { context: {} };

		performanceMark( req, 'parent-1' );
		performanceMark( req, 'child-1', true );
		performanceMark( req, 'parent-2' );
		performanceMark( req, 'parent-3' );

		expect( req.context.performanceMarks.length ).toBe( 3 );
	} );

	it( 'only adds children to the appropriate steps', () => {
		const req = { context: {} };

		// First mark and some steps.
		performanceMark( req, 'parent-1' );
		performanceMark( req, 'child-1', true );
		performanceMark( req, 'child-2', true );

		// Second mark and no steps.
		performanceMark( req, 'parent-2' );

		// Third mark and one step.
		performanceMark( req, 'parent-3' );
		performanceMark( req, 'child-3', true );

		// Fourth mark and no steps.
		performanceMark( req, 'parent-4' );

		const marks = req.context.performanceMarks;
		expect( marks[ 0 ].steps.length ).toBe( 2 );
		expect( marks[ 1 ].steps ).toBeUndefined();
		expect( marks[ 2 ].steps.length ).toBe( 1 );
		expect( marks[ 3 ].steps ).toBeUndefined();
		expect( marks.length ).toBe( 4 );
	} );

	it( 'does not overwrite durations', () => {
		const req = { context: {} };

		performanceMark( req, 'parent-1' );
		performanceMark( req, 'child-1', true );
		jest.advanceTimersByTime( 5 );
		finalizePerfMarks( req );

		expect( req.context.performanceMarks[ 0 ].duration ).toBe( 5 );
		expect( req.context.performanceMarks[ 0 ].steps[ 0 ].duration ).toBe( 5 );

		jest.advanceTimersByTime( 200 );
		// Normally, this would update the duration of pending marks. Since they
		// were already updated by finalizePerfMarks, it should do nothing.
		performanceMark( req, 'test' );
		expect( req.context.performanceMarks[ 0 ].duration ).toBe( 5 );
		expect( req.context.performanceMarks[ 0 ].steps[ 0 ].duration ).toBe( 5 );
	} );
} );

describe( 'finalizePerfMarks', () => {
	it( 'returns an empty object of no marks exist', () => {
		const req1 = {};
		expect( finalizePerfMarks( req1 ) ).toStrictEqual( {} );

		const req2 = { context: {} };
		expect( finalizePerfMarks( req2 ) ).toStrictEqual( {} );

		const req3 = { context: { performanceMarks: null } };
		expect( finalizePerfMarks( req3 ) ).toStrictEqual( {} );

		const req4 = { context: { performanceMarks: [] } };
		expect( finalizePerfMarks( req4 ) ).toStrictEqual( {} );
	} );

	it( 'finalizes mark durations and returns the marks', () => {
		const req = { context: {} };
		performanceMark( req, 'test' );
		performanceMark( req, 'test child', true );
		jest.advanceTimersByTime( 55 );

		expect( req.context.performanceMarks[ 0 ].duration ).toBeUndefined();
		expect( req.context.performanceMarks[ 0 ].steps[ 0 ].duration ).toBeUndefined();

		const finalMarks = finalizePerfMarks( req );
		// The by-ref update still works:
		expect( req.context.performanceMarks[ 0 ].duration ).toBe( 55 );
		expect( req.context.performanceMarks[ 0 ].steps[ 0 ].duration ).toBe( 55 );
		expect( finalMarks[ '0_test' ].total_duration ).toBe( 55 );
		expect( finalMarks[ '0_test' ][ '0_test_child' ] ).toBe( 55 );
	} );

	it( 'returns a array normalized to an object for logstash', () => {
		const req = { context: {} };
		performanceMark( req, 'test' );
		performanceMark( req, 'test child', true );
		jest.advanceTimersByTime( 55 );
		performanceMark( req, 'another test' );
		jest.advanceTimersByTime( 2 );
		performanceMark( req, 'another test child', true );
		jest.advanceTimersByTime( 1000 );
		performanceMark( req, 'test child once more', true );
		jest.advanceTimersByTime( 3 );
		performanceMark( req, 'another-mark' );
		jest.advanceTimersByTime( 70 );

		const finalMarks = finalizePerfMarks( req );
		// First mark has one child:
		expect( finalMarks[ '0_test' ].total_duration ).toBe( 55 );
		expect( finalMarks[ '0_test' ][ '0_test_child' ] ).toBe( 55 );

		// Second mark has two children indexed correctly:
		expect( finalMarks[ '1_another_test' ].total_duration ).toBe( 1005 );
		expect( finalMarks[ '1_another_test' ][ '0_another_test_child' ] ).toBe( 1000 );
		expect( finalMarks[ '1_another_test' ][ '1_test_child_once_more' ] ).toBe( 3 );

		// Third mark has no children and just a total duration:
		expect( finalMarks[ '2_another_mark' ].total_duration ).toBe( 70 );
		expect( Object.keys( finalMarks[ '2_another_mark' ] ).length ).toBe( 1 );
	} );
} );
