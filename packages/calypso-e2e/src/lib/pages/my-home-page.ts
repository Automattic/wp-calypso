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

/**
 * Represents the My Home page that users land on after logging in.
 *
 * @augments {BaseContainer}
 */
export class MyHomePage extends BaseContainer {
	/**
	 * Constructs an instance of the MyHomePage object.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.dashboard );
	}
}
