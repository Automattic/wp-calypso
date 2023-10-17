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
	readonly VIEWPORT_NAME: ViewportName;
	readonly GUTENBERG_EDGE: boolean;
	readonly GUTENBERG_NIGHTLY: boolean;
	readonly COBLOCKS_EDGE: boolean;
	readonly TEST_LOCALES: TestLocales;
	readonly COOKIES_PATH: string;
	readonly AUTHENTICATE_ACCOUNTS: TestAccountName[];
	readonly ARTIFACTS_PATH: string;
	readonly HEADLESS: boolean;
	readonly SLOW_MO: number;
	readonly TIMEOUT: number;
	readonly TEST_ON_ATOMIC: boolean;
	readonly ATOMIC_VARIATION: AtomicVariation;
	readonly JETPACK_TARGET: JetpackTarget;
	readonly CALYPSO_BASE_URL: string;
	readonly BROWSER_NAME: string;
	readonly ALLURE_RESULTS_PATH: string;
	readonly RUN_ID: string;
	readonly RETRY_COUNT: number;
}
