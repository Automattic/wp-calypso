/**
 * External dependencies
 */
import { Context } from 'mocha';
import * as fs from 'fs/promises';

/**
 * Internal dependencies
 */
import { start, close } from '../browser-manager';
import { getLogDir } from '../media-helper';

/**
 * Hook to start a new Browser instance.
 *
 * @param {Context} this Mocha context at the suite level.
 * @returns {void} No return value.
 */
export async function startBrowser( this: Context ): Promise< void > {
	this.page = await start();
}

export async function createLogDir( this: Context ): Promise< void > {
	const logDir = getLogDir();

	if ( ! fs.access( logDir ) ) {
		await fs.mkdir( `${ getLogDir() }` );
	}
}

/**
 * Hook to close a single Page instance.
 *
 * @param {Context} this Mocha context at the suite level.
 * @returns {void} No return value.
 */
export async function closePage( this: Context ): Promise< void > {
	await this.page.close();
}

/**
 * Hook to close a Browser instance.
 *
 * @returns {void} No return value.
 */
export async function closeBrowser(): Promise< void > {
	await close();
}
