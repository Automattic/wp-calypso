const { Runner, Hook } = require( 'mocha' );
const {
	EVENT_RUN_BEGIN,
	EVENT_TEST_BEGIN,
	EVENT_TEST_FAIL,
	EVENT_TEST_PENDING,
	EVENT_TEST_END,
	EVENT_HOOK_BEGIN,
	EVENT_HOOK_END,
	EVENT_SUITE_BEGIN,
	EVENT_SUITE_END,
} = Runner.constants;

const TEAMCITY_TEST_SUITE_STARTED = 'testSuiteStarted';
const TEAMCITY_TEST_SUITE_FINISHED = 'testSuiteFinished';
const TEAMCITY_TEST_STARTED = 'testStarted';
const TEAMCITY_TEST_FINISHED = 'testFinished';
const TEAMCITY_TEST_FAILED = 'testFailed';
const TEAMCITY_TEST_IGNORED = 'testIgnored';
const TEAMCITY_TEST_RETRY = 'testRetrySupport';

const escape = ( str = '' ) =>
	String( str )
		.replace( /(['|[\]])/g, '|$1' )
		.replace( /[\n]/g, '|n' )
		.replace( /[\r]/g, '|r' );

const teamCityMessage = ( { messageName, ...args } ) => {
	const payload = [ messageName, `flowId='${ process.pid }'` ];
	for ( const [ name, value ] of Object.entries( args ) ) {
		payload.push( `${ name }='${ escape( value ) }'` );
	}
	console.log( `##teamcity[${ payload.join( ' ' ) }]` );
};

const enableRetrySupport = () => {
	teamCityMessage( {
		messageName: TEAMCITY_TEST_RETRY,
	} );
};

const suiteBegin = ( { rootSuiteName, recordRootSuite } ) => ( suite ) => {
	if ( ! recordRootSuite && suite.root ) return;

	teamCityMessage( {
		messageName: TEAMCITY_TEST_SUITE_STARTED,
		name: suite.root ? rootSuiteName : suite.title,
	} );
};

const suiteEnd = ( { rootSuiteName, recordRootSuite } ) => ( suite ) => {
	if ( ! recordRootSuite && suite.root ) return;

	teamCityMessage( {
		messageName: TEAMCITY_TEST_SUITE_FINISHED,
		name: suite.root ? rootSuiteName : suite.title,
	} );
};

const testBegin = ( test ) => {
	teamCityMessage( {
		messageName: TEAMCITY_TEST_STARTED,
		name: test.title,
	} );
};

const testPending = ( test ) => {
	teamCityMessage( {
		messageName: TEAMCITY_TEST_IGNORED,
		name: test.title,
	} );
};

const testFail = ( test, err ) => {
	teamCityMessage( {
		messageName: TEAMCITY_TEST_FAILED,
		message: err.message,
		details: err.stack,
		name: test.title,
		actual: err.actual,
	} );
};

const testEnd = ( test ) => {
	// Alraedy reported as EVENT_TEST_PENDING
	if ( test.pending ) return;

	teamCityMessage( {
		messageName: TEAMCITY_TEST_FINISHED,
		name: test.title,
		duration: test.duration,
	} );
};

class TeamCityReporter {
	constructor(
		runner,
		{
			reporterOptions = {
				supportTestRetry: 'false',
				rootSuiteName: 'Root suite',
				recordHooks: 'false',
				recordRootSuite: 'false',
			},
		}
	) {
		const supportTestRetry = reporterOptions.supportTestRetry === 'true';
		const recordHooks = reporterOptions.recordHooks === 'true';
		const recordRootSuite = reporterOptions.recordRootSuite === 'true';
		const { rootSuiteName } = reporterOptions;

		if ( supportTestRetry ) {
			runner.once( EVENT_RUN_BEGIN, enableRetrySupport );
		}

		if ( recordHooks ) {
			runner.on( EVENT_HOOK_BEGIN, testBegin );
			runner.on( EVENT_HOOK_END, testEnd );
		}

		runner.on( EVENT_SUITE_BEGIN, suiteBegin( { rootSuiteName, recordRootSuite } ) );
		runner.on( EVENT_SUITE_END, suiteEnd( { rootSuiteName, recordRootSuite } ) );

		// No need to listen for TEST_PASS, TeamCity will assume a test passes it it is not PENDING or FAIL
		runner.on( EVENT_TEST_BEGIN, testBegin );
		runner.on( EVENT_TEST_PENDING, testPending );
		runner.on( EVENT_TEST_FAIL, ( runable, err ) => {
			if ( recordHooks && runable instanceof Hook ) {
				// When a hook fails, it won't trigger EVENT_HOOK_END, so we log it manually here.
				testFail( runable, err );
				testEnd( runable );
			} else {
				testFail( runable, err );
			}
		} );
		runner.on( EVENT_TEST_END, testEnd );
	}
}

module.exports = TeamCityReporter;
