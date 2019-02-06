/** @format */

import { By as by } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';

export default class StoreDashboardPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .dashboard.main' ) );
	}
}
