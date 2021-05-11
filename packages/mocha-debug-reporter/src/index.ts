/**
 * External dependencies
 */
import Mocha from 'mocha';
import fs from 'fs';
import path from 'path';

import type { Runner, MochaOptions, Suite, Hook, Test } from 'mocha';

const {
	EVENT_RUN_BEGIN,
	EVENT_RUN_END,
	EVENT_DELAY_BEGIN,
	EVENT_DELAY_END,

	EVENT_SUITE_BEGIN,
	EVENT_SUITE_END,
	EVENT_HOOK_BEGIN,
	EVENT_HOOK_END,
	EVENT_TEST_BEGIN,
	EVENT_TEST_END,
	EVENT_TEST_FAIL,
	EVENT_TEST_PASS,
} = Mocha.Runner.constants;

interface Event {
	timestamp: Date;
	name: string;
	data?: Record< string, unknown >;
}

export = class DebugReporter extends Mocha.reporters.Base {
	events: Event[];
	reporterOptions?: Record< string, unknown >;

	constructor( runner: Runner, options: MochaOptions ) {
		super( runner, options );
		this.events = [];
		this.reporterOptions = options.reporterOptions;

		runner.on( EVENT_RUN_BEGIN, () => this.addEvent( 'RUN_BEGIN' ) );
		runner.on( EVENT_RUN_END, () => this.addEvent( 'RUN_END' ) );
		runner.on( EVENT_DELAY_BEGIN, () => this.addEvent( 'DELAY_BEGIN' ) );
		runner.on( EVENT_DELAY_END, () => this.addEvent( 'DELAY_END' ) );
		runner.on( EVENT_SUITE_BEGIN, ( suite: Suite ) => this.addSuiteEvent( 'SUITE_BEGIN', suite ) );
		runner.on( EVENT_SUITE_END, ( suite: Suite ) => this.addSuiteEvent( 'SUITE_END', suite ) );
		runner.on( EVENT_HOOK_BEGIN, ( hook: Hook ) => this.addHookEvent( 'HOOK_BEGIN', hook ) );
		runner.on( EVENT_HOOK_END, ( hook: Hook ) => this.addHookEvent( 'HOOK_END', hook ) );
		runner.on( EVENT_TEST_BEGIN, ( test: Test ) => this.addTestEvent( 'TEST_BEGIN', test ) );
		runner.on( EVENT_TEST_END, ( test: Test ) => this.addTestEvent( 'TEST_END', test ) );
		runner.on( EVENT_TEST_FAIL, ( test: Test ) => this.addTestEvent( 'TEST_FAIL', test ) );
		runner.on( EVENT_TEST_PASS, ( test: Test ) => this.addTestEvent( 'TEST_PASS', test ) );

		runner.on( EVENT_RUN_END, () => this.writeLog() );
	}

	writeLog(): void {
		const fileTemplate = path.resolve(
			process.cwd(),
			( this.reporterOptions?.file as string ) ?? 'mocha-debug.log'
		);
		const fileName = fileTemplate.replace(
			/%(.*?)%/,
			( _match, envVar ) => process.env[ envVar ] || ''
		);
		fs.writeFileSync( fileName, JSON.stringify( this.events, null, 2 ) );
	}

	addSuiteEvent( eventName: string, suite: Suite ): void {
		this.addEvent( eventName, {
			title: suite.fullTitle(),
			tests: suite.total(),
			file: suite.file,
		} );
	}
	addHookEvent( eventName: string, hook: Hook ): void {
		this.addEvent( eventName, {
			title: hook.fullTitle(),
		} );
	}
	addTestEvent( eventName: string, test: Test ): void {
		this.addEvent( eventName, {
			title: test.fullTitle(),
			file: test.file,
			state: test.state,
			speed: test.speed,
		} );
	}
	addEvent( eventName: string, data?: Record< string, unknown > ): void {
		const event: Event = {
			timestamp: new Date(),
			name: eventName,
			data,
		};
		this.events.push( event );
	}
};

// function JSONReporter( runner, options ) {
// 	Base.call( this, runner, options );

// 	const self = this;
// 	const tests = [];
// 	const pending = [];
// 	const failures = [];
// 	const passes = [];

// 	runner.on( EVENT_TEST_END, function ( test ) {
// 		tests.push( test );
// 	} );

// 	runner.on( EVENT_TEST_PASS, function ( test ) {
// 		passes.push( test );
// 	} );

// 	runner.on( EVENT_TEST_FAIL, function ( test ) {
// 		failures.push( test );
// 	} );

// 	runner.on( EVENT_TEST_PENDING, function ( test ) {
// 		pending.push( test );
// 	} );

// 	runner.once( EVENT_RUN_END, function () {
// 		const obj = {
// 			stats: self.stats,
// 			tests: tests.map( clean ),
// 			pending: pending.map( clean ),
// 			failures: failures.map( clean ),
// 			passes: passes.map( clean ),
// 		};

// 		runner.testResults = obj;

// 		process.stdout.write( JSON.stringify( obj, null, 2 ) );
// 	} );
// }

// /**
//  * Return a plain-object representation of `test`
//  * free of cyclic properties etc.
//  *
//  * @private
//  * @param {Object} test
//  * @returns {Object}
//  */
// function clean( test ) {
// 	let err = test.err || {};
// 	if ( err instanceof Error ) {
// 		err = errorJSON( err );
// 	}

// 	return {
// 		title: test.title,
// 		fullTitle: test.fullTitle(),
// 		file: test.file,
// 		duration: test.duration,
// 		currentRetry: test.currentRetry(),
// 		speed: test.speed,
// 		err: cleanCycles( err ),
// 	};
// }

// /**
//  * Replaces any circular references inside `obj` with '[object Object]'
//  *
//  * @private
//  * @param {Object} obj
//  * @returns {Object}
//  */
// function cleanCycles( obj ) {
// 	const cache = [];
// 	return JSON.parse(
// 		JSON.stringify( obj, function ( key, value ) {
// 			if ( typeof value === 'object' && value !== null ) {
// 				if ( cache.indexOf( value ) !== -1 ) {
// 					// Instead of going in a circle, we'll print [object Object]
// 					return '' + value;
// 				}
// 				cache.push( value );
// 			}

// 			return value;
// 		} )
// 	);
// }

// /**
//  * Transform an Error object into a JSON object.
//  *
//  * @private
//  * @param {Error} err
//  * @returns {Object}
//  */
// function errorJSON( err ) {
// 	const res = {};
// 	Object.getOwnPropertyNames( err ).forEach( function ( key ) {
// 		res[ key ] = err[ key ];
// 	}, err );
// 	return res;
// }

// JSONReporter.description = 'single JSON object';
