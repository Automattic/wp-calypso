import { getViewports, getMag16Locales } from '../data-helper';
import { TestAccountName } from '../index';

const VIEWPORT_NAMES = getViewports();
const TEST_LOCALES = getMag16Locales();

export type EnvVariableKey = string;
export type EnvVariableValue = boolean | string | string[] | number;
export type EnvVariables = {
	[ key: EnvVariableKey ]: EnvVariableValue;
};

export type ViewportName = typeof VIEWPORT_NAMES[ number ];
export type TestLocales = string[] & typeof TEST_LOCALES;

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
}
