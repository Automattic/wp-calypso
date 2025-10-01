import page from '@automattic/calypso-router';
import { makeLayout, redirectIfDuplicatedView, render as clientRender } from 'calypso/controller';
import { siteSelection } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		redirectIfDuplicatedView( 'options-discussion.php' ),
		siteSettings,
		makeLayout,
		clientRender
	);
}
