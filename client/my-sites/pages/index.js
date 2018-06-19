/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import pagesController from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';
import { getSiteFragment } from 'lib/route';

export default function() {
	if ( config.isEnabled( 'manage/pages' ) ) {
		page(
			'/pages/:status(published|drafts|scheduled|trashed)/:domain?',
			siteSelection,
			navigation,
			pagesController.pages,
			makeLayout,
			clientRender
		);

		page(
			'/pages/:domain?',
			siteSelection,
			navigation,
			pagesController.pages,
			makeLayout,
			clientRender
		);

		page( '/pages/*', ( { path } ) => {
			const siteFragment = getSiteFragment( path );
			if ( siteFragment ) {
				return page.redirect( `/pages/${ siteFragment }` );
			}

			return page.redirect( '/pages' );
		} );
	}
}
