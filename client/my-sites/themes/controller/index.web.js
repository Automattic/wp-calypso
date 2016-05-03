/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from 'my-sites/themes/logged-out';
import i18n from 'lib/mixins/i18n';
import trackScrollPage from 'lib/track-scroll-page';
import buildTitle from 'lib/screen-title/utils';
import { makeElement, getAnalyticsData, LoggedOutHead } from './index.node.js';
import DefaultHead from 'layout/head';

/**
 * Re-export
 */
export { details } from './index.node.js';

function getMultiSiteProps( context ) {
	const { tier } = context.params;
	const { path, title } = getAnalyticsData( context );

	const boundTrackScrollPage = function() {
		trackScrollPage(
			path,
			title,
			'Themes'
		);
	};

	return {
		tier,
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage
	};
}

function getSingleSiteProps( context ) {
	const { site_id: siteId } = context.params;

	const props = getMultiSiteProps( context );

	props.key = siteId;
	props.siteId = siteId;

	return props;
}

const LoggedInHead = ( { children, context: { params: { tier, site_id: siteID } } } ) => (
	<DefaultHead
		title={ buildTitle(
			i18n.translate( 'Themes', { textOnly: true } ),
			{ siteID }
		) }
		tier={ tier || 'all' }>
		{ children }
	</DefaultHead>
);

export const singleSite = makeElement(
	SingleSiteComponent,
	getSingleSiteProps,
	LoggedInHead,
	getAnalyticsData
);

export const multiSite = makeElement(
	MultiSiteComponent,
	getMultiSiteProps,
	LoggedInHead,
	getAnalyticsData
);

export const loggedOut = makeElement(
	LoggedOutComponent,
	getMultiSiteProps,
	LoggedOutHead,
	getAnalyticsData
);
