import path from 'path';

const VIEWPORT_NAMES = [ 'mobile', 'desktop' ] as const;
const LOCALES = [
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
type EnvVariableValue = boolean | string | string[] | number;
type EnvVariables = {
	[ key: EnvVariableKey ]: EnvVariableValue;
};

interface SupportedEnvVariables extends EnvVariables {
	VIEWPORT_NAME: typeof VIEWPORT_NAMES[ number ];
	LOCALE: typeof LOCALES[ number ] | typeof LOCALES[ number ][];
	HEADLESS: boolean;
	SLOW_MO: number;
	GUTENBERG_EDGE: boolean;
	COBLOCKS_EDGE: boolean;
	COOKIES_PATH: string;
	SAVE_AUTH_COOKIES: boolean | string;
	ARTIFACTS_PATH: string;
}

const castEnvVariable = ( value: EnvVariableKey ): EnvVariableValue => {
	if ( value === 'false' ) {
		return false;
	}
	if ( value === 'true' ) {
		return true;
	}
	if ( ! Number.isNaN( value ) ) {
		return Number( value );
	}
	if ( value.split( ',' ).length > 0 ) {
		return value.split( ',' );
	}

	return value;
};

const defaultEnvVariables: SupportedEnvVariables = {
	VIEWPORT_NAME: 'desktop',
	LOCALE: 'en',
	HEADLESS: false,
	SLOW_MO: 0,
	GUTENBERG_EDGE: false,
	COBLOCKS_EDGE: false,
	COOKIES_PATH: path.join( process.cwd(), 'cookies' ),
	SAVE_AUTH_COOKIES: false,
	ARTIFACTS_PATH: path.join( process.cwd(), 'results' ),
};

const currentEnvVariables = { ...defaultEnvVariables };

Object.keys( currentEnvVariables ).forEach( ( name ) => {
	const currentValue = process.env[ name ];
	if ( currentValue ) {
		// We can dynamically validate the env var value here if needed.
		currentEnvVariables[ name ] = castEnvVariable( currentValue );
	}
} );

export default Object.freeze( currentEnvVariables );
