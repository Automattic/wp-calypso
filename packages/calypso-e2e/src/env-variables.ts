/* eslint-disable jsdoc/require-jsdoc */
import crypto from 'crypto';
import path from 'path';
import { getViewports } from './data-helper';
import { SupportedEnvVariables, JetpackTarget, AtomicVariation } from './types/env-variables.types';

// The concrete variations a mixed run picks from. `mixed` is not one of them: it is the request
// to pick one.
export const ATOMIC_VARIATIONS: AtomicVariation[] = [
	'default',
	'php-old',
	'php-new',
	'wp-beta',
	'wp-previous',
	'private',
	'ecomm-plan',
];

// Spec files are recognised by name: `blocks__jetpack-other.spec.ts` in a frame such as
// `at Object.<anonymous> (/agent/test/e2e/specs/blocks/blocks__jetpack-other.spec.ts:19:5)`.
const SPEC_FRAME = /([^/\\\s(]+\.spec\.ts):\d+:\d+/;

// What a mixed run resolves per spec file.
const SPEC_SCOPED: ReadonlyArray< keyof SupportedEnvVariables > = [ 'ATOMIC_VARIATION', 'RUN_ID' ];

// The spec file of the test the worker is running, recorded by a Playwright fixture.
let runningSpecFile: string | undefined;

/**
 * Records the spec file of the running test, for mixed Atomic runs resolved from code
 * that is not in a spec file, such as fixtures.
 */
export function setRunningSpecFile( file: string | undefined ): void {
	runningSpecFile = file;
}

class EnvVariables implements SupportedEnvVariables {
	private _defaultEnvVariables: SupportedEnvVariables = {
		A8C_FOR_AGENCIES_URL: 'https://agencies.automattic.com',
		ATOMIC_VARIATION: 'default',
		CALYPSO_BASE_URL: `http://calypso.localhost:${ process.env.PORT || 3000 }`,
		COBLOCKS_EDGE: false,
		COOKIES_PATH: path.join( process.cwd(), 'cookies' ),
		DASHBOARD_BASE_URL: `http://my.localhost:${ process.env.PORT || 3000 }`,
		GUTENBERG_EDGE: false,
		GUTENBERG_NIGHTLY: false,
		MAILOSAUR_LIMIT_REACHED: false,
		JETPACK_TARGET: 'wpcom-production',
		PARTNER_DIRECTORY_BASE_URL: 'https://wordpress.com/development-services',
		RUN_ID: '',
		TEST_ON_ATOMIC: false,
		TIMEOUT: 15000,
		VIEWPORT_NAME: 'desktop',
		WOO_BASE_URL: 'https://woocommerce.com',
		WPCOM_BASE_URL: 'https://wordpress.com',
	};

	get VIEWPORT_NAME(): string {
		const value = process.env.VIEWPORT_NAME;
		if ( ! value ) {
			return this._defaultEnvVariables.VIEWPORT_NAME;
		}

		const supportedValues = getViewports() as ReadonlyArray< string >;
		if ( ! supportedValues.includes( value as string ) ) {
			throw new Error(
				`Unknown VIEWPORT_NAME value: ${ value }.\nSupported values: ${ supportedValues }`
			);
		}
		return value;
	}

	get TIMEOUT(): number {
		const value = process.env.TIMEOUT;
		return value ? castAsNumber( 'TIMEOUT', value ) : this._defaultEnvVariables.TIMEOUT;
	}

	get GUTENBERG_EDGE(): boolean {
		const value = process.env.GUTENBERG_EDGE;
		return value
			? castAsBoolean( 'GUTENBERG_EDGE', value )
			: this._defaultEnvVariables.GUTENBERG_EDGE;
	}

	get GUTENBERG_NIGHTLY(): boolean {
		const value = process.env.GUTENBERG_NIGHTLY;
		return value
			? castAsBoolean( 'GUTENBERG_NIGHTLY', value )
			: this._defaultEnvVariables.GUTENBERG_NIGHTLY;
	}

	get MAILOSAUR_LIMIT_REACHED(): boolean {
		const value = process.env.MAILOSAUR_LIMIT_REACHED;
		return value
			? castAsBoolean( 'MAILOSAUR_LIMIT_REACHED', value )
			: this._defaultEnvVariables.MAILOSAUR_LIMIT_REACHED;
	}

	get COBLOCKS_EDGE(): boolean {
		const value = process.env.COBLOCKS_EDGE;
		return value
			? castAsBoolean( 'COBLOCKS_EDGE', value )
			: this._defaultEnvVariables.COBLOCKS_EDGE;
	}

	get COOKIES_PATH(): string {
		const value = process.env.COOKIES_PATH;
		return value ? value : this._defaultEnvVariables.COOKIES_PATH;
	}

	get TEST_ON_ATOMIC(): boolean {
		const value = process.env.TEST_ON_ATOMIC;
		return value
			? castAsBoolean( 'TEST_ON_ATOMIC', value )
			: this._defaultEnvVariables.TEST_ON_ATOMIC;
	}

	get ATOMIC_VARIATION(): AtomicVariation {
		const value = process.env.ATOMIC_VARIATION;
		if ( ! value ) {
			return this._defaultEnvVariables.ATOMIC_VARIATION;
		}

		const supportedValues: AtomicVariation[] = [ ...ATOMIC_VARIATIONS, 'mixed' ];
		if ( ! supportedValues.includes( value as AtomicVariation ) ) {
			throw new Error(
				`Unknown ATOMIC_VARIATION value: ${ value }.\nSupported values: ${ supportedValues.join(
					' | '
				) }`
			);
		}

		if ( value === 'mixed' ) {
			return getAtomicVariationInMixedRun( getAtomicVariationKey(), getCurrentSpecFile() );
		}

		return value as AtomicVariation;
	}

	get JETPACK_TARGET(): JetpackTarget {
		const value = process.env.JETPACK_TARGET;
		if ( ! value ) {
			return this._defaultEnvVariables.JETPACK_TARGET;
		}

		const supportedValues: JetpackTarget[] = [
			'remote-site',
			'wpcom-production',
			'wpcom-deployment',
		];
		if ( ! supportedValues.includes( value as JetpackTarget ) ) {
			throw new Error(
				`Unknown JETPACK_TARGET value: ${ value }.\nSupported values: ${ supportedValues.join(
					' | '
				) }`
			);
		}
		return value as JetpackTarget;
	}

	get PARTNER_DIRECTORY_BASE_URL(): string {
		return this.getValidatedUrlEnvVar( 'PARTNER_DIRECTORY_BASE_URL' );
	}
	/**
	 * Helper to get and validate a URL environment variable.
	 */
	private getValidatedUrlEnvVar( envVarName: keyof SupportedEnvVariables ): string {
		const value = process.env[ envVarName as string ];
		const defaultValue = this._defaultEnvVariables[ envVarName ];
		const url = value || defaultValue;

		try {
			// eslint-disable-next-line no-new
			new URL( url as string );
		} catch {
			throw new Error( `Invalid ${ envVarName } value: ${ url }.\nYou must provide a valid URL.` );
		}
		return url as string;
	}

	/**
	 * Returns the A8C for Agencies URL.
	 * @example 'https://agencies.automattic.com'
	 */
	get A8C_FOR_AGENCIES_URL(): string {
		return this.getValidatedUrlEnvVar( 'A8C_FOR_AGENCIES_URL' );
	}

	/**
	 * Returns the Calypso base URL.
	 * @example 'http://calypso.localhost:3000'
	 */
	get CALYPSO_BASE_URL(): string {
		return this.getValidatedUrlEnvVar( 'CALYPSO_BASE_URL' );
	}

	/**
	 * Returns the Dashboard base URL.
	 * @example 'http://my.localhost:3000'
	 */
	get DASHBOARD_BASE_URL(): string {
		return this.getValidatedUrlEnvVar( 'DASHBOARD_BASE_URL' );
	}

	/**
	 * Returns the WooCommerce base URL.
	 * @example 'https://woocommerce.com'
	 */
	get WOO_BASE_URL(): string {
		return this.getValidatedUrlEnvVar( 'WOO_BASE_URL' );
	}

	/**
	 * Returns the WordPress.com base URL typically used for testing non-Calypso Marketing pages.
	 * @example 'https://wordpress.com'
	 */
	get WPCOM_BASE_URL(): string {
		return this.getValidatedUrlEnvVar( 'WPCOM_BASE_URL' );
	}

	get RUN_ID(): string {
		const value = process.env.RUN_ID;
		// Support our Jetpack "mixed" atomic test strategy.
		// We still want to preserve test history as we randomly rotate through the variations.
		// And we won't know the variation at the command line to use as the run ID.
		if ( ! value && this.JETPACK_TARGET === 'wpcom-deployment' && this.TEST_ON_ATOMIC ) {
			return `Atomic: ${ this.ATOMIC_VARIATION }`;
		}
		return value ? value : this._defaultEnvVariables.RUN_ID;
	}

	validate() {
		// A mixed run resolves these per spec file, and none is loaded yet: check the key,
		// and leave the resolution to the specs.
		const isMixedRun = process.env.ATOMIC_VARIATION === 'mixed';
		if ( isMixedRun ) {
			getAtomicVariationKey();
		}

		for ( const property in this._defaultEnvVariables ) {
			const envVarName = property as keyof SupportedEnvVariables;
			if ( isMixedRun && SPEC_SCOPED.includes( envVarName ) ) {
				continue;
			}

			// Access each property
			// Any validation errors within the getter will throw an exception here.
			void this[ envVarName ];
		}
	}
}

function getAtomicVariationKey(): string {
	const value = process.env.ATOMIC_VARIATION_KEY;
	if ( ! value ) {
		throw new Error(
			`ATOMIC_VARIATION=mixed requires ATOMIC_VARIATION_KEY: set it to the commit SHA, or set ATOMIC_VARIATION to one of ${ ATOMIC_VARIATIONS.join(
				' | '
			) }.`
		);
	}

	return value;
}

// The spec file reading the variation, by name only so every agent checkout agrees. A spec on
// the call stack covers its module load, hooks and test bodies; the recorded file covers
// fixtures and tests declared in shared helpers. During a test both must name the same file,
// or the test would read one site's variation while its fixtures log in to another. Hooks
// have only the stack: a hook helper that loses it, through a timer say, throws.
function getCurrentSpecFile(): string {
	// V8 captures the frames on construction, so the limit can go back before `.stack` runs
	// Playwright's stack rewriting.
	const stackTraceLimit = Error.stackTraceLimit;
	Error.stackTraceLimit = Infinity;
	const error = new Error();
	Error.stackTraceLimit = stackTraceLimit;
	const stack = error.stack ?? '';

	const stackFile = stack.match( SPEC_FRAME )?.[ 1 ];
	const runningFile = runningSpecFile && path.basename( runningSpecFile );
	if ( stackFile && runningFile && stackFile !== runningFile ) {
		throw new Error(
			`ATOMIC_VARIATION=mixed resolves a variation per spec file, but ${ stackFile } is read while a test of ${ runningFile } runs: its fixtures would pick another site. Move the shared code out of the spec file.`
		);
	}

	const file = stackFile ?? runningFile;
	if ( ! file ) {
		throw new Error(
			'ATOMIC_VARIATION=mixed resolves a variation per spec file, but none is loading or running: read it from a spec file, a test, or a test fixture.'
		);
	}

	return path.basename( file );
}

// Keyed on the run and the spec file, so a run spreads its spec files over every Atomic site
// instead of sending every worker to one. A spec resolves its variation once when Playwright
// collects it and again in the worker that runs it, and both see the same key and file name.
function getAtomicVariationInMixedRun( key: string, specFile: string ): AtomicVariation {
	// Hashed, not counted: a re-run of the same commit has to repeat the variation that failed.
	const hash = crypto
		.createHash( 'md5' )
		.update( `${ key }:${ specFile }` )
		.digest()
		.readUInt8( 0 );

	return ATOMIC_VARIATIONS[ hash % ATOMIC_VARIATIONS.length ];
}

function castAsNumber( name: string, value: string ): number {
	const output = Number( value );
	if ( ! Number.isFinite( output ) ) {
		throw new Error( `Incorrect type of the ${ name } variable - expecting number` );
	}
	return output;
}

function castAsBoolean( name: string, value: string ): boolean {
	const caseInsensitiveValue = value.toLowerCase();
	if ( caseInsensitiveValue === 'true' || caseInsensitiveValue === '1' ) {
		return true;
	}
	if ( caseInsensitiveValue === 'false' || caseInsensitiveValue === '0' ) {
		return false;
	}
	throw new Error( `Incorrect type of the ${ name } variable - expecting boolean` );
}

export default new EnvVariables();
