/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection } from 'my-sites/controller';
import { authenticate, redirect } from '../editor/controller';
import { gutenbergWithoutIframe } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { performanceTrackerStart } from 'lib/performance-tracking/performance-tracker-start';

export default function () {
	page(
		'/without-iframe/block-editor/post/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		performanceTrackerStart( 'without-iframe' ),
		gutenbergWithoutIframe,
		makeLayout,
		clientRender
	);

	page(
		'/without-iframe/block-editor/page/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		performanceTrackerStart( 'without-iframe' ),
		gutenbergWithoutIframe,
		makeLayout,
		clientRender
	);
}
