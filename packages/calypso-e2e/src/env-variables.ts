import path from 'path';
import { getMag16Locales, getViewports } from './data-helper';
import { TEST_ACCOUNT_NAMES } from './secrets';
import { TestAccountName } from '.';
import type { SupportedEnvVariables, EnvVariableValue } from './types/env-variables.types';

const VIEWPORT_NAMES = getViewports();
const MAG16_LOCALES = getMag16Locales();
const defaultEnvVariables: SupportedEnvVariables = {
	VIEWPORT_NAME: 'desktop',
	TEST_LOCALES: [ ...MAG16_LOCALES ],
	HEADLESS: false,
	SLOW_MO: 0,
	TIMEOUT: 10000,
	GUTENBERG_EDGE: false,
	COBLOCKS_EDGE: false,
	AUTHENTICATE_ACCOUNTS: [ 'simpleSitePersonalPlanUser', 'atomicUser', 'defaultUser' ],
	COOKIES_PATH: path.join( process.cwd(), 'cookies' ),
	ARTIFACTS_PATH: path.join( process.cwd(), 'results' ),
	TEST_ON_ATOMIC: false,
	TEST_ON_JETPACK: false,
	CALYPSO_BASE_URL: 'https://wordpress.com',
	BROWSER_NAME: 'chromium',
	ALLURE_RESULTS_PATH: '',
};

/**
 * Captures and performs type check on all known environment variables.
 *
 * When a new environment variable is to be added, make sure to add the variable to
 * both the definition above and the `SupportedEnvVariables` interface.
 *
 * @param {string} name Name of the environment variable.
 * @param {string} value Value of the environment variable.
 * @returns {EnvVariableValue} Cast and type-checked environment variable value.
 */
const castKnownEnvVariable = ( name: string, value: string ): EnvVariableValue => {
	let output: EnvVariableValue = value;

	// Cast based on the default value type.
	switch ( defaultEnvVariables[ name ].constructor.name ) {
		case 'Number': {
			output = Number( value );
			if ( Number.isNaN( output ) ) {
				throw new Error( `Incorrect type of the ${ name } variable - expecting number` );
			}
			break;
		}
		case 'Boolean': {
			if ( value === 'true' ) {
				output = true;
			}
			if ( value === 'false' ) {
				output = false;
			}
			if ( typeof output !== 'boolean' ) {
				throw new Error( `Incorrect type of the ${ name } variable - expecting boolean` );
			}
			break;
		}
		case 'Array': {
			output = value.split( ',' );
			break;
		}
	}

	// Validate specific variables
	switch ( name ) {
		case 'VIEWPORT_NAME': {
			const supportedValues = VIEWPORT_NAMES as ReadonlyArray< string >;
			if ( ! supportedValues.includes( output as string ) ) {
				throw new Error(
					`Unknown VIEWPORT_NAME value: ${ output }.\nSupported values: ${ VIEWPORT_NAMES }`
				);
			}
			break;
		}
		case 'TEST_LOCALES': {
			const supportedValues = MAG16_LOCALES as ReadonlyArray< string >;
			if ( ! ( output as string[] ).every( ( v ) => supportedValues.includes( v ) ) ) {
				throw new Error(
					`Unknown TEST_LOCALES value: ${ output }.\nSupported values: ${ MAG16_LOCALES }`
				);
			}
			break;
		}
		case 'AUTHENTICATE_ACCOUNTS': {
			const supportedValues = new Set< TestAccountName >( TEST_ACCOUNT_NAMES );
			if ( ! ( output as TestAccountName[] ).every( ( v ) => supportedValues.has( v ) ) ) {
				throw new Error(
					`Unknown AUTHENTICATE_ACCOUNTS value: ${ output }.\nSupported values: ${ TEST_ACCOUNT_NAMES }`
				);
			}
			break;
		}
		case 'CALYPSO_BASE_URL': {
			try {
				// Disabling eslint because this constructor is really the simplest way to validate a URL.
				// eslint-disable-next-line no-new
				new URL( output as string );
			} catch ( error ) {
				throw new Error(
					`Invalid CALYPSO_BASE_URL value: ${ output }.\nYou must provide a valid URL.`
				);
			}
		}
	}

	return output;
};

const supportedEnvVariableNames = Object.keys( defaultEnvVariables );
const currentEnvVariables = { ...defaultEnvVariables };

supportedEnvVariableNames.forEach( ( name ) => {
	const originalValue = process.env[ name ];
	if ( originalValue ) {
		currentEnvVariables[ name ] = castKnownEnvVariable( name, originalValue );
	}
} );

// @{TODO}: Should we add proxy trap to fallback to process.env values?
export default Object.freeze( currentEnvVariables );
