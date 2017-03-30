/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import mySitesController from 'my-sites/controller';

import { makeLayout, render as clientRender } from 'controller';

const redirectToTrafficSection = ( context ) => {
	page.redirect( '/settings/traffic/' + ( context.params.site_id || '' ) );
};

export default function() {
	page(
	 '/settings/traffic/:site_id',
	 mySitesController.siteSelection,
	 mySitesController.navigation,
	 controller.traffic,
	 makeLayout,
	 clientRender
	);

	// redirect legacy urls
	page(
	 '/settings/analytics/:site_id',
	 redirectToTrafficSection,
	 makeLayout,
	 clientRender
	);
	page(
	 '/settings/seo/:site_id',
	 redirectToTrafficSection,
	 makeLayout,
	 clientRender
	);
}
