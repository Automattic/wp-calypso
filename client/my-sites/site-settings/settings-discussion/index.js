/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discussion } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		discussion,
		makeLayout,
		clientRender
	);
}
