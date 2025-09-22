import { TestAccountName } from '../';

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
	| 'ecomm-plan'
	| 'mixed';

export interface SupportedEnvVariables {
	readonly A8C_FOR_AGENCIES_URL: string;
	readonly ALLURE_RESULTS_PATH: string;
	readonly ARTIFACTS_PATH: string;
	readonly ATOMIC_VARIATION: AtomicVariation;
	readonly AUTHENTICATE_ACCOUNTS: TestAccountName[];
	readonly BROWSER_NAME: string;
	readonly CALYPSO_BASE_URL: string;
	readonly COBLOCKS_EDGE: boolean;
	readonly COOKIES_PATH: string;
	readonly GUTENBERG_EDGE: boolean;
	readonly GUTENBERG_NIGHTLY: boolean;
	readonly HEADLESS: boolean;
	readonly JETPACK_TARGET: JetpackTarget;
	readonly RETRY_COUNT: number;
	readonly RUN_ID: string;
	readonly SLOW_MO: number;
	readonly TEST_LOCALES: TestLocales;
	readonly TEST_ON_ATOMIC: boolean;
	readonly TIMEOUT: number;
	readonly VIEWPORT_NAME: ViewportName;
	readonly WPCOM_BASE_URL: string;
}
