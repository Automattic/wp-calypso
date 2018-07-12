/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from 'my-sites/controller';
import { post } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'gutenberg' ) ) {
		page( '/gutenberg', '/gutenberg/post' );
		page( '/gutenberg/post', siteSelection, sites, makeLayout, clientRender );
		page( '/gutenberg/post/:site?/:post?', siteSelection, post, makeLayout, clientRender );
		page( '/gutenberg/page', siteSelection, sites, makeLayout, clientRender );
		page( '/gutenberg/page/:site?/:post?', siteSelection, post, makeLayout, clientRender );
	} else {
		page( '/gutenberg', '/post' );
		page( '/gutenberg/*', '/post' );
	}
	//don't forget CPTs later
}
