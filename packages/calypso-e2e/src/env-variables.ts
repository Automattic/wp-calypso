/* eslint-disable require-jsdoc */
import crypto from 'crypto';
import path from 'path';
import { getMag16Locales, getViewports } from './data-helper';
import { TEST_ACCOUNT_NAMES } from './secrets';
import { SupportedEnvVariables, JetpackTarget, AtomicVariation } from './types/env-variables.types';
import { TestAccountName } from '.';

class EnvVariables implements SupportedEnvVariables {
	private _defaultEnvVariables: SupportedEnvVariables = {
		VIEWPORT_NAME: 'desktop',
		TEST_LOCALES: [ ...getMag16Locales() ],
		HEADLESS: false,
		SLOW_MO: 0,
		TIMEOUT: 10000,
		GUTENBERG_EDGE: false,
		GUTENBERG_NIGHTLY: false,
		COBLOCKS_EDGE: false,
		AUTHENTICATE_ACCOUNTS: [],
		COOKIES_PATH: path.join( process.cwd(), 'cookies' ),
		ARTIFACTS_PATH: path.join( process.cwd(), 'results' ),
		TEST_ON_ATOMIC: false,
		ATOMIC_VARIATION: 'default',
		JETPACK_TARGET: 'wpcom-production',
		CALYPSO_BASE_URL: 'https://wordpress.com',
		BROWSER_NAME: 'chromium',
		ALLURE_RESULTS_PATH: '',
		RUN_ID: '',
		RETRY_COUNT: 0,
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

	get TEST_LOCALES(): string[] {
		const value = process.env.TEST_LOCALES;
		if ( ! value ) {
			return this._defaultEnvVariables.TEST_LOCALES;
		}

		const parsedLocales = value.split( ',' );
		const supportedValues = getMag16Locales() as ReadonlyArray< string >;
		if ( ! parsedLocales.every( ( v ) => supportedValues.includes( v ) ) ) {
			throw new Error(
				`Unknown TEST_LOCALES value: ${ value }.\nSupported values: ${ supportedValues.join(
					' | '
				) }`
			);
		}
		return parsedLocales;
	}

	get HEADLESS(): boolean {
		const value = process.env.HEADLESS;
		return value ? castAsBoolean( 'HEADLESS', value ) : this._defaultEnvVariables.HEADLESS;
	}

	get SLOW_MO(): number {
		const value = process.env.SLOW_MO;
		return value ? castAsNumber( 'SLOW_MO', value ) : this._defaultEnvVariables.SLOW_MO;
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

	get COBLOCKS_EDGE(): boolean {
		const value = process.env.COBLOCKS_EDGE;
		return value
			? castAsBoolean( 'COBLOCKS_EDGE', value )
			: this._defaultEnvVariables.COBLOCKS_EDGE;
	}

	get AUTHENTICATE_ACCOUNTS(): TestAccountName[] {
		const value = process.env.AUTHENTICATE_ACCOUNTS;
		if ( ! value ) {
			return this._defaultEnvVariables.AUTHENTICATE_ACCOUNTS;
		}

		const parsedAccounts: TestAccountName[] = value.split( ',' ) as TestAccountName[];
		const supportedValues = new Set< TestAccountName >( TEST_ACCOUNT_NAMES );
		if ( ! parsedAccounts.every( ( account ) => supportedValues.has( account ) ) ) {
			throw new Error(
				`Unknown AUTHENTICATE_ACCOUNTS value: ${ value }.\nSupported values: ${ TEST_ACCOUNT_NAMES }`
			);
		}
		return parsedAccounts;
	}

	get COOKIES_PATH(): string {
		const value = process.env.COOKIES_PATH;
		return value ? value : this._defaultEnvVariables.COOKIES_PATH;
	}

	get ARTIFACTS_PATH(): string {
		const value = process.env.ARTIFACTS_PATH;
		return value ? value : this._defaultEnvVariables.ARTIFACTS_PATH;
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

		const supportedValues: AtomicVariation[] = [
			'default',
			'php-old',
			'php-new',
			'wp-beta',
			'wp-previous',
			'private',
			'ecomm-plan',
			'mixed',
		];
		if ( ! supportedValues.includes( value as AtomicVariation ) ) {
			throw new Error(
				`Unknown ATOMIC_VARIATION value: ${ value }.\nSupported values: ${ supportedValues.join(
					' | '
				) }`
			);
		}

		if ( value === 'mixed' ) {
			return getAtomicVariationInMixedRun();
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

	get CALYPSO_BASE_URL(): string {
		const value = process.env.CALYPSO_BASE_URL;
		if ( ! value ) {
			return this._defaultEnvVariables.CALYPSO_BASE_URL;
		}

		try {
			// Disabling eslint because this constructor is really the simplest way to validate a URL.
			// eslint-disable-next-line no-new
			new URL( value );
		} catch ( error ) {
			throw new Error(
				`Invalid CALYPSO_BASE_URL value: ${ value }.\nYou must provide a valid URL.`
			);
		}
		return value;
	}

	get BROWSER_NAME(): string {
		const value = process.env.BROWSER_NAME;
		return value ? value : this._defaultEnvVariables.BROWSER_NAME;
	}

	get ALLURE_RESULTS_PATH(): string {
		const value = process.env.ALLURE_RESULTS_PATH;
		return value ? value : this._defaultEnvVariables.ALLURE_RESULTS_PATH;
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

	get RETRY_COUNT(): number {
		const value = process.env.RETRY_COUNT;
		return value ? castAsNumber( 'RETRY_COUNT', value ) : this._defaultEnvVariables.RETRY_COUNT;
	}

	validate() {
		for ( const property in this._defaultEnvVariables ) {
			const envVarName = property as keyof SupportedEnvVariables;
			// Access each property
			// Any validation errors within the getter will throw an exception here.
			this[ envVarName ];
		}
	}
}

function getAtomicVariationInMixedRun() {
	const allVariations: AtomicVariation[] = [
		'default',
		// Disable pending rename of the blogs. p1720019588866209-slack-C05Q5HSS013
		//'php-old',
		//'php-new',
		'wp-beta',
		'wp-previous',
		'private',
		'ecomm-plan',
	];
	// The goal here is controlled randomness to include multiple variations within a single run.
	// By using the current day of the month and the test file name hash, we can get a
	// lot of variation throughout the week while also ensuring the same variation is used on a failed retry.
	const currentDayOfMonth = new Date().getDate();
	const currentTestFileName = global.testFileName || '';
	const fileHash = hashTestFileName( currentTestFileName );
	const variationIndex = ( currentDayOfMonth + fileHash ) % allVariations.length;
	return allVariations[ variationIndex ];
}

function hashTestFileName( testFileName: string ): number {
	return Math.abs( crypto.createHash( 'md5' ).update( testFileName ).digest().readInt8() );
}

function castAsNumber( name: string, value: string ): number {
	const output = Number( value );
	if ( Number.isNaN( output ) ) {
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
