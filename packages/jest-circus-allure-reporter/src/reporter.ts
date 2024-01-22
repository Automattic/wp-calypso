import { createHash } from 'crypto';
import os from 'os';
import { Circus } from '@jest/types';
import {
	AllureGroup,
	AllureRuntime,
	AllureStep,
	AttachmentOptions,
	AllureTest,
	ExecutableItemWrapper,
	LabelName,
	Stage,
	Status,
} from 'allure-js-commons';
import { parseWithComments } from 'jest-docblock';
import { ContentType } from './types';

/**
 * Represents an instance of an AllureReporter.
 */
export class AllureReporter {
	currentExecutable: ExecutableItemWrapper | null = null;
	private readonly allureRuntime: AllureRuntime;
	private readonly suites: AllureGroup[] = [];
	private readonly steps: AllureStep[] = [];
	private readonly tests: AllureTest[] = [];

	/**
	 * Construct an instance of the AllureReporter.
	 * @param options Key/pair parameters.
	 * @param {AllureRuntime} options.allureRuntime Instance of Allure runtime exposed by allure-js-commons.
	 * @param {Record<string, string>} [options.environmentInfo] Customized Jest environment variables.
	 */
	constructor( options: {
		allureRuntime: AllureRuntime;
		environmentInfo?: Record< string, string >;
	} ) {
		this.allureRuntime = options.allureRuntime;

		if ( options.environmentInfo ) {
			this.allureRuntime.writeEnvironmentInfo( options.environmentInfo );
		}
	}

	/**
	 * Returns the current suite.
	 */
	get currentSuite(): AllureGroup | null {
		return this.suites.length > 0 ? this.suites[ this.suites.length - 1 ] : null;
	}

	/**
	 * Returns the current step.
	 */
	get currentStep(): AllureStep | null {
		return this.steps.length > 0 ? this.steps[ this.steps.length - 1 ] : null;
	}

	/**
	 * Returns the current test file.
	 */
	get currentTest(): AllureTest | null {
		return this.tests.length > 0 ? this.tests[ this.tests.length - 1 ] : null;
	}

	/**
	 * Optionally the environment information.
	 */
	environmentInfo( info?: Record< string, string > ) {
		this.allureRuntime.writeEnvironmentInfo( info );
	}

	/**
	 * Starts a new test file in Allure.
	 *
	 * A test file represents all top-level describe blocks in a spec file.
	 *
	 * This method calls the `startSuite` implementation.
	 * @param {string} fileName Name of the spec file.
	 */
	startTestFile( fileName?: string ): void {
		this.startSuite( fileName );
	}

	/**
	 * Ends the file, thereby ending all suites in Allure.
	 */
	endTestFile(): void {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for ( const _ of this.suites ) {
			this.endSuite();
		}
	}

	/**
	 * Starts a new suite in Allure.
	 * @param {string} [suiteName] Name of the suite.
	 */
	startSuite( suiteName?: string ): void {
		const scope: AllureGroup | AllureRuntime = this.currentSuite ?? this.allureRuntime;
		// If no suiteName is provided, place the tests under Global suite.
		const suite: AllureGroup = scope.startGroup( suiteName ?? 'Global' );
		this.pushSuite( suite );
	}

	/**
	 * Ends the suite in Allure.
	 * @throws {Error} If this method is called without a running suite.
	 */
	endSuite(): void {
		if ( this.currentSuite === null ) {
			throw new Error( 'endSuite called while no suite is running' );
		}

		if ( this.steps.length > 0 ) {
			for ( const step of this.steps ) {
				step.endStep();
			}
		}

		if ( this.tests.length > 0 ) {
			for ( const test of this.tests ) {
				test.endTest();
			}
		}

		this.currentSuite.endGroup();
		this.popSuite();
	}

	/**
	 * Starts the hook in Allure.
	 *
	 * If the hook is of the `beforeXYZ` type, it is added to the beginning
	 * of the suite.
	 *
	 * If the hook is of the `afterXYZ` type, it is added at the end of the suite.
	 * @param {Circus.HookType} type Type of the hook being run.
	 */
	startHook( type: Circus.HookType ): void {
		const suite: AllureGroup | null = this.currentSuite;

		if ( suite && type.startsWith( 'before' ) ) {
			this.currentExecutable = suite.addBefore();
		}

		if ( suite && type.startsWith( 'after' ) ) {
			this.currentExecutable = suite.addAfter();
		}
	}

	/**
	 * Ends the hook in Allure.
	 *
	 * If this method is called outside of a hook, an error is thrown.
	 *
	 * Otherwise, the hook is marked as passed and finished.
	 * @param {Error} [error] Hook failures if any.
	 * @throws {Error} If this method is called outside of a hook.
	 */
	endHook( error?: Error ): void {
		if ( this.currentExecutable === null ) {
			throw new Error( 'endHook called while no executable is running' );
		}

		if ( error ) {
			const { status, message, trace } = this.handleError( error );

			this.currentExecutable.status = status;
			this.currentExecutable.statusDetails = { message, trace };
			this.currentExecutable.stage = Stage.FINISHED;
		}

		if ( ! error ) {
			this.currentExecutable.status = Status.PASSED;
			this.currentExecutable.stage = Stage.FINISHED;
		}
	}

	/**
	 * Starts the test case in Allure.
	 * @param {Circus.TestEntry} test Test step.
	 * @param {Circus.State} state State of the test step.
	 * @param {string} testPath Path to the test file.
	 * @throws {Error} If this method is called without a running suite.
	 */
	startTestStep( test: Circus.TestEntry, state: Circus.State, testPath: string ): void {
		if ( this.currentSuite === null ) {
			throw new Error( 'startTestCase called while no suite is running' );
		}

		let currentTest = this.currentSuite.startTest( test.name );
		currentTest.fullName = test.name;
		// Derive a hexadecimal representation of the MD5 hash of test path
		// and name so that history can be generated.
		currentTest.historyId = createHash( 'md5' )
			.update( testPath + '.' + test.name )
			.digest( 'hex' );
		currentTest.stage = Stage.RUNNING;

		if ( test.fn ) {
			const serializedTestCode = test.fn.toString();
			const { code, comments, pragmas } = this.extractCodeDetails( serializedTestCode );

			this.setAllureReportPragmas( currentTest, pragmas );

			currentTest.description = `${ comments }\n### Test\n\`\`\`typescript\n${ code }\n\`\`\`\n`;
		}

		if ( ! test.fn ) {
			currentTest.description = '### Test\nCode is not available.\n';
		}

		if ( state.parentProcess?.env?.JEST_WORKER_ID ) {
			currentTest.addLabel( LabelName.THREAD, state.parentProcess.env.JEST_WORKER_ID );
		}

		currentTest = this.addSuiteLabelsToTestCase( currentTest, testPath );
		this.pushTest( currentTest );
	}

	/**
	 * Mark the test case as passed in Allure.
	 */
	passTestStep(): void {
		if ( this.currentTest === null ) {
			throw new Error( 'passTestCase called while no test is running' );
		}

		this.currentTest.status = Status.PASSED;
	}

	/**
	 * Mark the test case as pending/todo in Allure.
	 * @param {Circus.TestEntry} test Test step which is pending.
	 * @throws {Error} If this method is called without a running suite.
	 */
	pendingTestStep( test: Circus.TestEntry ): void {
		if ( this.currentTest === null ) {
			throw new Error( 'pendingTestCase called while no test is running' );
		}

		this.currentTest.status = Status.SKIPPED;
		this.currentTest.statusDetails = { message: `Test is marked: "${ test.mode as string }"` };
	}

	/**
	 * Mark the test case as failed in Allure.
	 * @param {Error} error Error returned by Jest.
	 * @throws {Error} If this method is called without a running suite.
	 */
	failTestStep( error: Error ): void {
		if ( this.currentTest === null ) {
			throw new Error( 'failTestCase called while no test is running' );
		}

		const latestStatus = this.currentTest.status;

		// If test already has a failed/broken state, we should not overwrite it
		const isBrokenTest = latestStatus === Status.BROKEN && this.currentTest.stage !== Stage.RUNNING;
		if ( latestStatus === Status.FAILED || isBrokenTest ) {
			return;
		}

		const { status, message, trace } = this.handleError( error );

		this.currentTest.status = status;
		this.currentTest.statusDetails = { message, trace };
	}

	/**
	 * Ends the test step in Allure.
	 * @throws {Error} If this method is called without a running suite.
	 */
	endTestStep() {
		if ( this.currentTest === null ) {
			throw new Error( 'endTest called while no test is running' );
		}

		this.currentTest.stage = Stage.FINISHED;
		this.currentTest.endTest();
		this.popTest();
	}

	/**
	 * Writes attachment in the specified file format.
	 * @param {Buffer|string} content Content of the attachement.
	 * @param {ContentType|string|AttachmentOptions} type Type of attachment to write.
	 * @returns {string}
	 */
	writeAttachment(
		content: Buffer | string,
		type: ContentType | string | AttachmentOptions
	): string {
		if ( type === ContentType.HTML ) {
			// Allure-JS-Commons does not support HTML so we workaround this by providing the file extension.
			return this.allureRuntime.writeAttachment( content, {
				contentType: type,
				fileExtension: 'html',
			} );
		}

		return this.allureRuntime.writeAttachment( content, type );
	}

	/**
	 * Push the test step onto the stack.
	 * @param {AllureStep} step Allure representation of the test step.
	 */
	pushStep( step: AllureStep ): void {
		this.steps.push( step );
	}

	/**
	 * Pops the test step from the stack.
	 */
	popStep(): void {
		this.steps.pop();
	}

	/**
	 * Pushes the test onto the stack.
	 * @param {AllureTest} test Allure representation of the test.
	 */
	pushTest( test: AllureTest ): void {
		this.tests.push( test );
	}

	/**
	 * Pops the test from the stack.
	 */
	popTest(): void {
		this.tests.pop();
	}

	/**
	 * Pushes suite onto the stack.
	 * @param {AllureGroup} suite Group of tests representing a suite.
	 */
	pushSuite( suite: AllureGroup ): void {
		this.suites.push( suite );
	}

	/**
	 * Removes suite from the stack.
	 */
	popSuite(): void {
		this.suites.pop();
	}

	/**
	 * Adds the details of test failure into Allure.
	 * @param {Error} error Error returned by Jest.
	 */
	private handleError( error: Error | any ) {
		let status = Status.BROKEN;
		let message = error.name;
		let trace = error.message;

		if ( error.matcherResult ) {
			status = Status.FAILED;
			const matcherMessage =
				typeof error.matcherResult.message === 'function'
					? error.matcherResult.message()
					: error.matcherResult.message;

			const [ line1, line2, ...restOfMessage ] = matcherMessage.split( '\n' );

			message = [ line1, line2 ].join( '\n' );
			trace = restOfMessage.join( '\n' );
		}

		if ( ! trace ) {
			trace = error.stack;
		}

		if ( ! message && trace ) {
			message = trace;
			trace = error.stack?.replace( message, 'No stack trace provided' );
		}

		if ( trace?.includes( message ) ) {
			trace = trace?.replace( message, '' );
		}

		if ( ! message ) {
			message = 'Error. Expand for more details.';
			trace = error;
		}

		return {
			status,
			message: message,
			trace: trace,
		};
	}
	/**
	 * Extracts the test code.
	 * @param {string} serializedTestCode Test code.
	 */
	private extractCodeDetails( serializedTestCode: string ) {
		const docblock = this.extractDocBlock( serializedTestCode );
		const { pragmas, comments } = parseWithComments( docblock );

		const code = serializedTestCode.replace( docblock, '' );

		return { code, comments, pragmas };
	}

	/**
	 * Extracts docblock from the test code.
	 * @param {string} contents Test code.
	 */
	private extractDocBlock( contents: string ): string {
		const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/gm;

		const match = contents.match( docblockRe );
		return match ? match[ 0 ].trimStart() : '';
	}

	/**
	 *
	 * @param currentTest
	 * @param pragmas
	 */
	private setAllureReportPragmas(
		currentTest: AllureTest,
		pragmas: Record< string, string | string[] >
	) {
		// Disable the ESLint rule for next line only.
		// The variable `pragma` is not reassigned but `value` does require
		// reassignment.
		// eslint-disable-next-line prefer-const
		for ( let [ pragma, value ] of Object.entries( pragmas ) ) {
			if ( value instanceof String && value.includes( ',' ) ) {
				value = value.split( ',' );
			}

			if ( Array.isArray( value ) ) {
				for ( const v of value ) {
					this.setAllureLabelsAndLinks( currentTest, pragma, v );
				}
			}

			if ( ! Array.isArray( value ) ) {
				this.setAllureLabelsAndLinks( currentTest, pragma, value );
			}
		}
	}

	/**
	 *
	 * @param currentTest
	 * @param labelName
	 * @param value
	 */
	private setAllureLabelsAndLinks( currentTest: AllureTest, labelName: string, value: string ) {
		switch ( labelName ) {
			case 'tag':
			case 'tags':
				currentTest.addLabel( LabelName.TAG, value );
				break;
			case 'milestone':
				currentTest.addLabel( labelName, value );
				currentTest.addLabel( 'epic', value );
				break;
			default:
				currentTest.addLabel( labelName, value );
				break;
		}
	}

	/**
	 *
	 * @param currentTest
	 * @param testPath
	 * @returns
	 */
	private addSuiteLabelsToTestCase( currentTest: AllureTest, testPath: string ): AllureTest {
		const isWindows = os.type() === 'Windows_NT';
		const pathDelimiter = isWindows ? '\\' : '/';
		const pathsArray = testPath.split( pathDelimiter );

		const [ parentSuite, ...suites ] = pathsArray;
		const subSuite = suites.pop();

		if ( parentSuite ) {
			currentTest.addLabel( LabelName.PARENT_SUITE, parentSuite );
			currentTest.addLabel( LabelName.PACKAGE, parentSuite );
		}

		if ( suites.length > 0 ) {
			currentTest.addLabel( LabelName.SUITE, suites.join( ' > ' ) );
		}

		if ( subSuite ) {
			currentTest.addLabel( LabelName.SUB_SUITE, subSuite );
		}

		return currentTest;
	}
}
