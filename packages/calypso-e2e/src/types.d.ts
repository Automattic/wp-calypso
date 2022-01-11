import { Browser } from 'playwright';

// TODO: Remove
export type TargetDevice = 'desktop' | 'mobile' | 'laptop' | 'tablet';
// TODO: These doesn't seem to be used?
export type Plans = typeof PlansArray[ number ];
export const PlansArray = [ 'Free', 'Personal', 'Premium', 'Business', 'eCommerce' ] as const;

// Expose global browser initialized in jest.test-environment.js
declare global {
	namespace NodeJS {
		interface Global {
			browser: Browser;
		}
	}
}
