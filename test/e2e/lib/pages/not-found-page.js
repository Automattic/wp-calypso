/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class NotFoundPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( 'body.error404' ) );
	}
}
