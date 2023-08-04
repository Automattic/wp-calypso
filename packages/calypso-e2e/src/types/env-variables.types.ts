import { TestAccountName } from '../';

export type EnvVariableValue = boolean | string | string[] | number;
export type EnvVariables = {
	[ key: string ]: EnvVariableValue;
};

export type ViewportName = string;
export type TestLocales = string[];
export type JetpackTarget = 'remote-site' | 'wpcom-production' | 'wpcom-deployment';
export type AtomicVariation =
	| 'default'
	| 'php-old'
	| 'php-new'
	| 'wp-beta'
	| 'wp-previous'
	| 'private'
	| 'ecomm-plan';

export interface SupportedEnvVariables extends EnvVariables {
	VIEWPORT_NAME: ViewportName;
	GUTENBERG_EDGE: boolean;
	GUTENBERG_NIGHTLY: boolean;
	COBLOCKS_EDGE: boolean;
	TEST_LOCALES: TestLocales;
	COOKIES_PATH: string;
	AUTHENTICATE_ACCOUNTS: TestAccountName[];
	ARTIFACTS_PATH: string;
	HEADLESS: boolean;
	SLOW_MO: number;
	TIMEOUT: number;
	TEST_ON_ATOMIC: boolean;
	ATOMIC_VARIATION: AtomicVariation;
	JETPACK_TARGET: JetpackTarget;
	CALYPSO_BASE_URL: string;
	BROWSER_NAME: string;
	ALLURE_RESULTS_PATH: string;
}
