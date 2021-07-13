import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminDashboardPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '#wpbody #wpbody-content' ), url );
	}

	static getUrl( url ) {
		url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
		return `https://${ url }/wp-admin`;
	}
}
