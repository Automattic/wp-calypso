import page from '@automattic/calypso-router';
import Debug from 'debug';
import { translate } from 'i18n-calypso';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sites, siteSelection } from 'calypso/my-sites/controller';
import { landForPrimarySite, landForSelectedSite } from './sections/landing/controller';

const debug = new Debug( 'calypso:jetpack-cloud:controller' );

const selectionPrompt = ( context, next ) => {
	debug( 'controller: selectionPrompt', context );
	context.getSiteSelectionHeaderText = () =>
		// When "text-transform: capitalize;" is active,
		// (see rule for "".sites__select-heading strong")
		// Jetpack.com displays as Jetpack.Com in some browsers (e.g., Chrome)
		translate( 'Select a site to open {{strong}}Jetpack.com{{/strong}}', {
			components: { strong: <strong style={ { textTransform: 'none' } } /> },
		} );
	next();
};

const clearPageTitle = ( context, next ) => {
	context.clearPageTitle = true;
	next();
};

export default function () {
	page( '/landing/:site', siteSelection, landForSelectedSite, makeLayout, clientRender );
	page(
		'/landing',
		siteSelection,
		selectionPrompt,
		clearPageTitle,
		sites,
		makeLayout,
		clientRender
	);
	page( '/', landForPrimarySite, makeLayout, clientRender );
}
