import { Browser } from 'playwright';

// TODO: These doesn't seem to be used?
export type Plans = typeof PlansArray[ number ];
export const PlansArray = [ 'Free', 'Personal', 'Premium', 'Business', 'eCommerce' ] as const;

// Because these types are ultimately accessed on "window", adding them here.
interface TracksEventProperties {
	[ key: string ]: boolean | number | string;
}
export type TracksEvent = [ string, TracksEventProperties ];

// Expose global browser initialized in jest-playwright-config/test-environment.ts
declare global {
	// Node 16 types removed the NodeJS.Global interface in favor of just using globalThis.
	// See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/53669
	// This is the new syntax to modify globalThis. Note, 'let' and 'const' do not work!
	// See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#type-checking-for-globalthis
	// eslint-disable-next-line no-var
	var browser: Browser;

	interface Window {
		_e2eEventsStack: TracksEvent[];
	}
}
