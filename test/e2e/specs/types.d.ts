import { Browser } from 'playwright';

declare global {
	namespace NodeJS {
		interface Global {
			browser: Browser;
		}
	}
}
