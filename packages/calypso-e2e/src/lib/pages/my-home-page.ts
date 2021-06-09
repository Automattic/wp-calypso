/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	dashboard: '.customer-home__main',
	statsCard: '.stats',
};

export class MyHomePage extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.dashboard );
	}
}
