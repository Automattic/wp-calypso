import { Browser } from '@playwright/test';

declare global {
	namespace NodeJS {
		interface Global {
			browser: Browser;
		}
	}
}
