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

export default class DebugReporter extends Mocha.reporters.Base {
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
		const fileTemplate = ( this.reporterOptions?.file as string | undefined )?.replace(
			/%(.*?)%/,
			( _match, envVar ) => process.env[ envVar ] || ''
		);
		const fileName = path.resolve( process.cwd(), fileTemplate ?? './mocha-debug.log' );
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
}
