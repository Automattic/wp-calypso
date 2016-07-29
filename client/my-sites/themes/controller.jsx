/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';
import omit from 'lodash/omit';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from './single-site';
import MultiSiteComponent from './multi-site';
import LoggedOutComponent from './logged-out';
import trackScrollPage from 'lib/track-scroll-page';
import buildTitle from 'lib/screen-title/utils';
import { getAnalyticsData } from './helpers';

function makeElement( ThemesComponent, Head, store, props ) {
	return (
		<Head
			title={ props.title }
			description={ props.description }
			type={ 'website' }
			canonicalUrl={ props.canonicalUrl }
			image={ props.image }
			tier={ props.tier || 'all' }>
			<ThemesComponent { ...omit( props, [ 'title' ] ) } />
		</Head>
	);
}

function getProps( context ) {
	const { tier, site_id: siteId } = context.params;

	const title = buildTitle(
		i18n.translate( 'Themes', { textOnly: true } ),
		{ siteID: siteId } );

	const { basePath, analyticsPageTitle } = getAnalyticsData(
		context.path,
		tier,
		siteId
	);

	const boundTrackScrollPage = function() {
		trackScrollPage(
			basePath,
			analyticsPageTitle,
			'Themes'
		);
	};

	return {
		title,
		tier,
		analyticsPageTitle,
		analyticsPath: basePath,
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage
	};
}

export function singleSite( context, next ) {
	const Head = require( 'layout/head' );
	const { site_id: siteId } = context.params;
	const props = getProps( context );

	props.key = siteId;
	props.siteId = siteId;

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = makeElement( SingleSiteComponent, Head, context.store, props );
	next();
}

export function multiSite( context, next ) {
	const Head = require( 'layout/head' );
	const props = getProps( context );

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = makeElement( MultiSiteComponent, Head, context.store, props );
	next();
}

export function loggedOut( context, next ) {
	const Head = require( 'my-sites/themes/head' );
	const props = getProps( context );

	context.primary = makeElement( LoggedOutComponent, Head, context.store, props );
	next();
}
