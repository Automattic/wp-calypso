/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import config from 'config';
import sitesList from 'lib/sites-list';

const sites = sitesList();

function buildTitle( title, options ) {
	let pageTitle = '';

	options = toImmutable( options );

	if ( options.get( 'count' ) ) {
		pageTitle += '(' + options.get( 'count' ) + ') ';
	}

	pageTitle += title;

	if ( options.get( 'siteID' ) ) {
		pageTitle = appendSite( pageTitle, options );
	}

	if ( pageTitle ) {
		pageTitle = decodeEntities( pageTitle ) + ' — WordPress.com';
	} else {
		pageTitle = 'WordPress.com';
	}

	return pageTitle;
}

function appendSite( title, options ) {
	var siteName, site;

	if ( ! sites ) {
		if ( config( 'env' ) === 'development' ) {
			throw new Error( 'sites object not available; required before passing the siteID option' );
		}
		return title;
	}

	site = sites.getSite( options.get( 'siteID' ) );
	if ( site ) {
		if ( site.name ) {
			siteName = site.name;
		} else {
			siteName = site.domain;
		}
	} else {
		// Fallback to the slug
		siteName = options.get( 'siteID' );
	}

	if ( title ) {
		return title + ' \u2039 ' + siteName;
	}

	return siteName;
}

function toImmutable( object = {} ) {
	return object.toJS
		? object
		: fromJS( object );
}

export default buildTitle;
