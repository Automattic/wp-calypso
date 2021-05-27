/**
 * External dependencies
 */
import { Context } from 'mocha';

/**
 * Internal dependencies
 */
import { start, close } from '../browser-manager';

import { Page } from 'playwright';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Global {
			page: Page;
		}
	}
}

/**
 * Hook to start a new Browser instance.
 *
 * @param {Context} this Mocha context at the suite level.
 * @returns {void} No return value.
 */
export async function startBrowser( this: Context ): Promise< void > {
	global.page = await start();
}

/**
 * Hook to close a single Page instance.
 *
 * @param {Context} this Mocha context at the suite level.
 * @returns {void} No return value.
 */
export async function closePage( this: Context ): Promise< void > {
	await global.page.close();
}

/**
 * Hook to close a Browser instance.
 *
 * @returns {void} No return value.
 */
export async function closeBrowser(): Promise< void > {
	await close();
}
