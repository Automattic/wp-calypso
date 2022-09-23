import { TestAccountName } from '../';

export type EnvVariableValue = boolean | string | string[] | number;
export type EnvVariables = {
	[ key: string ]: EnvVariableValue;
};

export type ViewportName = string;
export type TestLocales = string[];

export interface SupportedEnvVariables extends EnvVariables {
	VIEWPORT_NAME: ViewportName;
	GUTENBERG_EDGE: boolean;
	COBLOCKS_EDGE: boolean;
	TEST_LOCALES: TestLocales;
	COOKIES_PATH: string;
	AUTHENTICATE_ACCOUNTS: TestAccountName[];
	ARTIFACTS_PATH: string;
	HEADLESS: boolean;
	SLOW_MO: number;
	TEST_ON_ATOMIC: boolean;
	TEST_ON_JETPACK: boolean;
	CALYPSO_BASE_URL: string;
	BROWSER_NAME: string;
	ALLURE_RESULTS_PATH: string;
}
