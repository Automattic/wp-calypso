import path from 'path';
import { Target } from './lib';

const VIEWPORT_NAMES = [ 'mobile', 'desktop' ] as const;
const TEST_LOCALES = [
	'en',
	'es',
	'pt-br',
	'de',
	'fr',
	'he',
	'ja',
	'it',
	'nl',
	'ru',
	'tr',
	'id',
	'zh-cn',
	'zh-tw',
	'ko',
	'ar',
	'sv',
] as const;
// TODO: Maybe move these to config? 👆

type EnvVariableKey = string;
type EnvVariableValue = boolean | string | string[] | number | undefined;
type EnvVariables = {
	[ key: EnvVariableKey ]: EnvVariableValue;
};

export type ViewportName = typeof VIEWPORT_NAMES[ number ];
export type TestLocales = string[] & typeof TEST_LOCALES;

type unspecified = 'unspecified';
type PluginReleaseTag = 'stable' | 'edge' | unspecified | undefined;

export interface SupportedEnvVariables extends EnvVariables {
	VIEWPORT_NAME: ViewportName;
	GUTENBERG?: PluginReleaseTag;
	COBLOCKS?: PluginReleaseTag;
	TEST_LOCALES: TestLocales;
	COOKIES_PATH: string;
	AUTHENTICATE_ACCOUNTS: string[];
	ARTIFACTS_PATH: string;
	HEADLESS: boolean;
	SLOW_MO: number;
	TARGET: Target;
}

const defaultEnvVariables: SupportedEnvVariables = {
	VIEWPORT_NAME: 'desktop',
	TEST_LOCALES: [ ...TEST_LOCALES ],
	HEADLESS: false,
	SLOW_MO: 0,
	AUTHENTICATE_ACCOUNTS: [ 'simpleSitePersonalPlanUser', 'eCommerceUser', 'defaultUser' ],
	COOKIES_PATH: path.join( process.cwd(), 'cookies' ),
	ARTIFACTS_PATH: path.join( process.cwd(), 'results' ),
	TARGET: 'simple',
};

const castKnownEnvVariable = ( name: string, value: string ): EnvVariableValue => {
	let output: EnvVariableValue = value;

	const envVal = defaultEnvVariables[ name ];

	if ( ! envVal ) return;

	// Cast based on the default value type.
	switch ( envVal.constructor.name ) {
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
			const supportedValues = TEST_LOCALES as ReadonlyArray< string >;
			if ( ! ( output as string[] ).every( ( v ) => supportedValues.includes( v ) ) ) {
				throw new Error(
					`Unknown TEST_LOCALES value: ${ output }.\nSupported values: ${ TEST_LOCALES }`
				);
			}
			break;
		}
	}

	return output;
};

const supportedEnvVariableNames = Object.keys( defaultEnvVariables );
const currentEnvVariables = { ...defaultEnvVariables };

supportedEnvVariableNames.forEach( ( name ) => {
	const originalValue = process.env[ name ];
	// Some env vars might be set with the `unspecified` "special" value to mean
	// they're effectivelly unset. This is useful to avoid creating condition
	// branches in the code that passes the vars to Jest, and one can just
	// pass `unspecified` and it will have the same effect as not setting it.
	if ( originalValue && ( originalValue as unspecified ) !== 'unspecified' ) {
		currentEnvVariables[ name ] = castKnownEnvVariable( name, originalValue );
	}
} );

// @{TODO}: Should we add proxy trap to fallback to process.env values?
export default Object.freeze( currentEnvVariables );
