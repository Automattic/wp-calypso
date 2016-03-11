/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from 'my-sites/themes/logged-out';
import analytics from 'analytics';
import i18n from 'lib/mixins/i18n';
import trackScrollPage from 'lib/track-scroll-page';
import buildTitle from 'lib/screen-title/utils';
import { getAnalyticsData } from '../helpers';
import { setSection } from 'state/ui/actions';
import { makeElement } from './index.node.js';

/**
 * Re-export
 */
export { details } from './index.node.js';

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

	const runClientAnalytics = function() {
		analytics.pageView.record( basePath, analyticsPageTitle );
	};

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
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage,
		runClientAnalytics
	};
}

export function singleSite( context, next ) {
	const Head = require( 'layout/head' );
	const { site_id: siteId } = context.params;
	const props = getProps( context );

	props.key = siteId;
	props.siteId = siteId;

	const section = {
		name: 'themes',
		group: 'sites',
		secondary: true,
	};

	context.store.dispatch( setSection( section, {} ) );

	context.primary = makeElement( SingleSiteComponent, Head, context.store, props );
	next();
}

export function multiSite( context, next ) {
	const Head = require( 'layout/head' );
	const props = getProps( context );

	const section = {
		name: 'themes',
		group: 'sites',
		secondary: true,
	};

	context.store.dispatch( setSection( section, {} ) );

	context.primary = makeElement( MultiSiteComponent, Head, context.store, props );
	next();
}

export function loggedOut( context, next ) {
	const Head = require( 'my-sites/themes/head' );
	const props = getProps( context );

	const section = {
		name: 'themes',
		group: 'sites',
		secondary: false,
	};

	context.store.dispatch( setSection( section, {} ) );

	context.primary = makeElement( LoggedOutComponent, Head, context.store, props );
	next();
}
