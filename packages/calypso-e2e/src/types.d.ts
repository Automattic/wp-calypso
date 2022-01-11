import { Browser } from 'playwright';

// TODO: These doesn't seem to be used?
export type Plans = typeof PlansArray[ number ];
export const PlansArray = [ 'Free', 'Personal', 'Premium', 'Business', 'eCommerce' ] as const;

// Expose global browser initialized in jest-playwright-config/test-environment.ts
declare global {
	namespace NodeJS {
		interface Global {
			browser: Browser;
		}
	}
}
