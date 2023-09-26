/* eslint-disable require-jsdoc */
import {
	Allure,
	AllureRuntime,
	AllureStep,
	AllureTest,
	AttachmentOptions,
	ExecutableItemWrapper,
	LabelName,
	Severity,
	Status,
	StepInterface,
	isPromise,
} from 'allure-js-commons';
import { StepWrapper } from '../step-wrapper';
import type { AllureReporter } from '../reporter';

/**
 * Supported content types for Allure attachments.
 *
 * _This enum was copied and extended from allure-js-commons_
 */
export enum ContentType {
	// Allure-js-commons ContentTypes:
	TEXT = 'text/plain',
	XML = 'application/xml',
	CSV = 'text/csv',
	TSV = 'text/tab-separated-values',
	CSS = 'text/css',
	URI = 'text/uri-list',
	SVG = 'image/svg+xml',
	PNG = 'image/png',
	JSON = 'application/json',
	WEBM = 'video/webm',
	JPEG = 'image/jpeg',
	// Custom extensions:
	HTML = 'text/html',
}

export default class JestAllureInterface extends Allure {
	constructor(
		private readonly reporter: AllureReporter,
		runtime: AllureRuntime
	) {
		super( runtime );
	}

	get currentExecutable(): AllureStep | AllureTest | ExecutableItemWrapper {
		const executable: AllureStep | AllureTest | ExecutableItemWrapper | null =
			this.reporter.currentStep ?? this.reporter.currentTest ?? this.reporter.currentExecutable;

		if ( ! executable ) {
			throw new Error( 'No executable!' );
		}

		return executable;
	}

	set currentExecutable( executable: AllureStep | AllureTest | ExecutableItemWrapper ) {
		this.reporter.currentExecutable = executable;
	}

	label( name: string, value: string ) {
		this.currentTest.addLabel( name, value );
	}

	severity( severity: Severity ) {
		this.label( LabelName.SEVERITY, severity );
	}

	tag( tag: string ) {
		this.currentTest.addLabel( LabelName.TAG, tag );
	}

	owner( owner: string ) {
		this.label( LabelName.OWNER, owner );
	}

	lead( lead: string ) {
		this.label( LabelName.LEAD, lead );
	}

	epic( epic: string ) {
		this.label( LabelName.EPIC, epic );
	}

	feature( feature: string ) {
		this.label( LabelName.FEATURE, feature );
	}

	story( story: string ) {
		this.label( LabelName.STORY, story );
	}

	startStep( name: string ): StepWrapper {
		const allureStep: AllureStep = this.currentExecutable.startStep( name );
		this.reporter.pushStep( allureStep );
		return new StepWrapper( this.reporter, allureStep );
	}

	async step( name: string, body: ( step: StepInterface ) => any ): Promise< any > {
		const wrappedStep = this.startStep( name );
		let result;
		try {
			result = wrappedStep.run( body );
		} catch ( error: unknown ) {
			wrappedStep.endStep();
			throw error;
		}

		if ( isPromise( result ) ) {
			const promise = result as Promise< any >;

			try {
				const resolved = await promise;
				wrappedStep.endStep();
				return resolved;
			} catch ( error: unknown ) {
				wrappedStep.endStep();
				throw error;
			}
		}

		wrappedStep.endStep();
		return result;
	}

	logStep(
		name: string,
		status: Status,
		attachments?: Array< {
			name: string;
			content: string;
			type: ContentType | string | AttachmentOptions;
		} >
	): void {
		const step = this.startStep( name );

		step.status = status;

		if ( attachments ) {
			for ( const a of attachments ) {
				this.attachment( a.name, a.content, a.type );
			}
		}

		step.endStep();
	}

	description( markdown: string ) {
		const { currentTest } = this.reporter;

		if ( ! currentTest ) {
			throw new Error( 'Expected a test to be executing before adding a description.' );
		}

		currentTest.description = markdown;
	}

	descriptionHtml( html: string ) {
		const { currentTest } = this.reporter;

		if ( ! currentTest ) {
			throw new Error( 'Expected a test to be executing before adding an HTML description.' );
		}

		currentTest.descriptionHtml = html;
	}

	attachment(
		name: string,
		content: Buffer | string,
		type: ContentType | string | AttachmentOptions
	): void {
		const file = this.reporter.writeAttachment( content, type );
		this.currentExecutable.addAttachment( name, type, file );
	}

	testAttachment(
		name: string,
		content: Buffer | string,
		type: ContentType | string | AttachmentOptions
	): void {
		const file = this.reporter.writeAttachment( content, type );
		this.currentTest.addAttachment( name, type, file );
	}

	get currentTest(): AllureTest {
		if ( this.reporter.currentTest === null ) {
			throw new Error( 'No test running!' );
		}

		return this.reporter.currentTest;
	}
}
