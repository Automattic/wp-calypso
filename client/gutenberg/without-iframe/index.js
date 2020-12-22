/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection } from 'calypso/my-sites/controller';
import { authenticate, redirect } from '../editor/controller';
import { gutenbergWithoutIframe } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { performanceTrackerStart } from 'calypso/lib/performance-tracking/performance-tracker-start';

export default function () {
	page(
		'/without-iframe/post/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		performanceTrackerStart( 'without-iframe' ),
		gutenbergWithoutIframe,
		makeLayout,
		clientRender
	);

	page(
		'/without-iframe/page/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		performanceTrackerStart( 'without-iframe' ),
		gutenbergWithoutIframe,
		makeLayout,
		clientRender
	);
}
