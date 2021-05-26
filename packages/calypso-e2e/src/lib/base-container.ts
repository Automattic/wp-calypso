/**
 * External dependencies
 */
import { Page } from 'playwright';

/**
 * Base class for asynchronously initializing objects.
 */
export class BaseContainer {
	[ x: string ]: any;
	page: Page;
	url: string;
	selector: string;

	/**
	 * Constructs an instance of a class.
	 *
	 * @param {Page} page The page on which interactions take place.
	 * @param {string} [selector] CSS selector that is expected to be located on page.
	 * @param {string} [url] URL of the page represented by the object.
	 */
	constructor( page: Page, selector = '', url = '' ) {
		this.page = page;
		this.url = url;
		this.selector = selector;
	}

	/**
	 * Constructs an instance of the object then waits for additional
	 * initialization steps to complete asynchronously.
	 *
	 * @param {Page} page The page on which interactions take place.
	 * @returns {Promise<BaseContainer} Initialized object.
	 */
	static async Expect( page: Page ): Promise< BaseContainer > {
		const base = new this( page );
		await base._init();
		return base;
	}

	/**
	 * Completes initialization of the object.
	 *
	 * There is provision to execute actions before and after the
	 * page is determined to have finished loading and the optional
	 * selector located.
	 *
	 * Note that the page is considered 'loaded' once the `load`
	 * event has fired.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _init(): Promise< void > {
		await this._visit();
		await this._preInit();
		await this.page.waitForLoadState( 'load' );
		if ( this.selector ) {
			await this.page.waitForSelector( this.selector );
		}
		await this._postInit();
	}

	/**
	 * Executes additional actions before page lod is completed.
	 *
	 * By default, no addition action is defined.
	 * To specify an initialization step after the page has loaded,
	 * override this class from the child class and define actions.
	 */
	async _preInit(): Promise< void > {
		return;
	}

	/**
	 * Executes additional actions after the page load is completed.
	 *
	 * By default, no addition action is defined.
	 * To specify an initialization step after the page has loaded,
	 * override this class from the child class and define actions.
	 */
	async _postInit(): Promise< void > {
		return;
	}

	/**
	 * Visits the URL if present. Do nothing otherwise.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _visit(): Promise< void > {
		if ( ! this.url ) {
			return;
		}
		await this.page.goto( this.url );
	}
}
